<template>
  <div class="container mx-auto p-4">
    <h1 class="text-3xl font-bold mb-6">{{ $t('tenantAdmins.title') }}</h1>

    <div class="bg-white shadow-md rounded-lg p-6 mb-8">
      <h2 class="text-2xl font-semibold mb-4">{{ $t('tenantAdmins.createAdmin') }}</h2>
      <form @submit.prevent="createTenantSuperAdmin">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="email" class="block text-gray-700 text-sm font-bold mb-2">{{ $t('tenantAdmins.email') }}:</label>
            <input
              type="email"
              id="email"
              v-model="newAdmin.email"
              required
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div>
            <label for="name" class="block text-gray-700 text-sm font-bold mb-2">{{ $t('tenantAdmins.name') }}:</label>
            <input
              type="text"
              id="name"
              v-model="newAdmin.name"
              required
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div>
            <label for="password" class="block text-gray-700 text-sm font-bold mb-2">{{ $t('tenantAdmins.password') }}:</label>
            <input
              type="password"
              id="password"
              v-model="newAdmin.password"
              required
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div>
            <label for="tenant" class="block text-gray-700 text-sm font-bold mb-2">{{ $t('tenantAdmins.selectTenant') }}:</label>
            <select
              id="tenant"
              v-model="newAdmin.tenant_id"
              required
              class="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="" disabled>{{ $t('tenantAdmins.chooseTenant') }}</option>
              <option v-for="tenant in tenants" :key="tenant.id" :value="tenant.id">
                {{ tenant.name }}
              </option>
            </select>
          </div>
        </div>
        <div class="mt-6">
          <button
            type="submit"
            :disabled="creatingAdmin"
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            :class="{ 'opacity-50 cursor-not-allowed': creatingAdmin }"
          >
            {{ creatingAdmin ? $t('tenantAdmins.creating') : $t('tenantAdmins.createButton') }}
          </button>
        </div>
      </form>
      <p v-if="adminSuccessMessage" class="text-green-500 mt-4">{{ adminSuccessMessage }}</p>
      <p v-if="adminErrorMessage" class="text-red-500 mt-4">{{ adminErrorMessage }}</p>
    </div>

    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '~/store/auth';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const authStore = useAuthStore();
const router = useRouter();

const tenants = ref([]);
const loadingTenants = ref(false);
const tenantsError = ref('');

const newAdmin = ref({
  email: '',
  name: '',
  password: '',
  tenant_id: ''
});
const creatingAdmin = ref(false);
const adminSuccessMessage = ref('');
const adminErrorMessage = ref('');

const fetchTenants = async (token) => {
  loadingTenants.value = true;
  tenantsError.value = '';
  try {
    const response = await fetch('http://localhost:8080/api/tenants', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.status === 401 || response.status === 403) {
      tenantsError.value = t('errors.authorizationError');
      authStore.clearAuth();
      router.push('/login');
      return;
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || t('errors.failedToFetchTenants'));
    }

    tenants.value = await response.json();
  } catch (error) {
    console.error('Error fetching tenants:', error);
    tenantsError.value = error.message || t('errors.failedToFetchTenants');
  } finally {
    loadingTenants.value = false;
  }
};

const createTenantSuperAdmin = async () => {
  creatingAdmin.value = true;
  adminSuccessMessage.value = '';
  adminErrorMessage.value = '';

  try {
    const token = authStore.token;
    if (!token) {
      adminErrorMessage.value = t('errors.notLoggedIn');
      router.push('/login');
      return;
    }

    const response = await fetch('http://localhost:8080/api/users/tenant-super-admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(newAdmin.value)
    });

    if (response.status === 401 || response.status === 403) {
      adminErrorMessage.value = t('errors.authorizationError');
      authStore.clearAuth();
      router.push('/login');
      return;
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || t('errors.failedToCreateAdmin'));
    }

    const createdUser = await response.json();
    adminSuccessMessage.value = t('tenantAdmins.adminCreatedSuccess', { email: createdUser.email });
    
    newAdmin.value = {
      email: '',
      name: '',
      password: '',
      tenant_id: ''
    };

  } catch (error) {
    console.error('Error creating tenant super admin:', error);
    adminErrorMessage.value = error.message || t('errors.failedToCreateAdmin');
  } finally {
    creatingAdmin.value = false;
  }
};

onMounted(() => {
  if (!authStore.isLoggedIn) {
    router.push('/login');
  } else if (!authStore.isGlobalSuperAdmin) {
    router.push('/dashboard');
  } else {
    fetchTenants(authStore.token);
  }
});

watch(() => authStore.isGlobalSuperAdmin, (newVal) => {
  if (!newVal) {
    router.push('/dashboard');
  }
});
</script>
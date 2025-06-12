<template>
  <div class="container mx-auto p-4">
    <h1 class="text-3xl font-bold mb-6">{{ $t('tenants.title') }}</h1>

    <div class="bg-white shadow-md rounded-lg p-6 mb-8">
      <h2 class="text-2xl font-semibold mb-4">{{ $t('tenants.createTenant') }}</h2>
      <form @submit.prevent="createTenant">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="tenantName" class="block text-gray-700 text-sm font-bold mb-2">{{ $t('tenants.name') }}:</label>
            <input
              type="text"
              id="tenantName"
              v-model="newTenant.name"
              required
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div>
            <label for="tenantType" class="block text-gray-700 text-sm font-bold mb-2">{{ $t('tenants.type') }}:</label>
            <select
              id="tenantType"
              v-model="newTenant.type"
              required
              class="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="" disabled>{{ $t('tenants.selectType') }}</option>
              <option value="Main">{{ $t('tenants.typeMain') }}</option>
              <option value="Branch">{{ $t('tenants.typeBranch') }}</option>
              <option value="Congregation">{{ $t('tenants.typeCongregation') }}</option>
              <option value="Ministry">{{ $t('tenants.typeMinistry') }}</option>
            </select>
          </div>
          <div class="col-span-1 md:col-span-2">
            <label for="parentTenant" class="block text-gray-700 text-sm font-bold mb-2">{{ $t('tenants.parent') }}:</label>
            <select
              id="parentTenant"
              v-model="newTenant.parent_id"
              class="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="">{{ $t('tenants.chooseParent') }}</option>
              <option v-for="tenant in tenants" :key="tenant.id" :value="tenant.id">
                {{ tenant.name }}
              </option>
            </select>
          </div>
        </div>
        <div class="mt-6">
          <button
            type="submit"
            :disabled="creatingTenant"
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            :class="{ 'opacity-50 cursor-not-allowed': creatingTenant }"
          >
            {{ creatingTenant ? $t('tenants.creating') : $t('tenants.createButton') }}
          </button>
        </div>
      </form>
      <p v-if="tenantSuccessMessage" class="text-green-500 mt-4">{{ tenantSuccessMessage }}</p>
      <p v-if="tenantErrorMessage" class="text-red-500 mt-4">{{ tenantErrorMessage }}</p>
    </div>

    <div class="bg-white shadow-md rounded-lg p-6">
      <h2 class="text-2xl font-semibold mb-4">{{ $t('tenants.listTenants') }}</h2>
      <p v-if="loadingTenants" class="text-gray-600">{{ $t('tenants.loading') }}</p>
      <p v-else-if="tenantsError" class="text-red-500">{{ tenantsError }}</p>
      <p v-else-if="tenants.length === 0" class="text-gray-600">{{ $t('tenants.noTenants') }}</p>
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ $t('tenants.id') }}
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ $t('tenants.name') }}
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ $t('tenants.type') }}
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ $t('tenants.parentName') }}
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ $t('tenants.createdAt') }}
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ $t('tenants.updatedAt') }}
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="tenant in tenants" :key="tenant.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ tenant.id }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ tenant.name }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ tenant.type }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ tenant.parent_name || 'N/A' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ new Date(tenant.created_at).toLocaleDateString() }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ new Date(tenant.updated_at).toLocaleDateString() }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useAuthStore } from '~/store/auth';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const authStore = useAuthStore();
const router = useRouter();

const tenants = ref([]);
const loadingTenants = ref(false);
const tenantsError = ref('');

const newTenant = ref({
  name: '',
  type: '',
  parent_id: null 
});
const creatingTenant = ref(false);
const tenantSuccessMessage = ref('');
const tenantErrorMessage = ref('');

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

const createTenant = async () => {
  creatingTenant.value = true;
  tenantSuccessMessage.value = '';
  tenantErrorMessage.value = '';

  try {
    const token = authStore.token;
    if (!token) {
      tenantErrorMessage.value = t('errors.notLoggedIn');
      router.push('/login');
      return;
    }

    const payload = { ...newTenant.value };
    if (payload.parent_id === '') {
      payload.parent_id = null;
    }

    const response = await fetch('http://localhost:8080/api/tenants', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (response.status === 401 || response.status === 403) {
      tenantErrorMessage.value = t('errors.authorizationError');
      authStore.clearAuth();
      router.push('/login');
      return;
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || t('errors.failedToCreateTenant'));
    }

    const createdTenant = await response.json();
    tenantSuccessMessage.value = t('tenants.tenantCreatedSuccess', { name: createdTenant.name });
    
    newTenant.value = { name: '', type: '', parent_id: null };
    await fetchTenants(token);

  } catch (error) {
    console.error('Error creating tenant:', error);
    tenantErrorMessage.value = error.message || t('errors.failedToCreateTenant');
  } finally {
    creatingTenant.value = false;
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

watch(() => authStore.token, (newToken) => {
  if (!newToken) {
    router.push('/login');
  }
});
</script>
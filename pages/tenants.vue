<template>
  <div class="tenant-management-container">
    <h1>{{ $t('tenants.title') }}</h1>

    <h2>{{ $t('tenants.create_new_title') }}</h2>
    <form @submit.prevent="createTenant" class="tenant-form">
      <div class="form-group">
        <label for="tenantName">{{ $t('tenants.form.name_label') }}</label>
        <input type="text" id="tenantName" v-model="tenantName" required>
      </div>

      <div class="form-group">
        <label for="tenantType">{{ $t('tenants.form.type_label') }}</label>
        <input type="text" id="tenantType" v-model="tenantType" required :placeholder="$t('tenants.form.type_placeholder')">
      </div>

      <div class="form-group">
        <label for="parentId">{{ $t('tenants.form.parent_id_label') }}</label>
        <input type="text" id="parentId" v-model="parentId" placeholder="e.g., a1b2c3d4-e5f6-7890-1234-567890abcdef">
      </div>

      <button type="submit">{{ $t('tenants.form.create_button') }}</button>
    </form>

    <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

    <hr>

    <h2>{{ $t('tenants.list.title') }}</h2>
    <p v-if="loadingTenants">{{ $t('tenants.list.loading') }}</p>
    <p v-else-if="tenantsError" class="error-message">{{ tenantsError }}</p>
    <div v-else-if="tenants.length === 0">
      <p>{{ $t('tenants.list.no_tenants') }}</p>
    </div>
    <ul v-else class="tenant-list">
      <li v-for="tenant in tenants" :key="tenant.id" class="tenant-item">
        <strong>{{ $t('tenants.list.name_label') }}</strong> {{ tenant.name }} <br>
        <strong>{{ $t('tenants.list.type_label') }}</strong> {{ tenant.type }} <br>
        <strong>{{ $t('tenants.list.id_label') }}</strong> {{ tenant.id }} <br>
        <span v-if="tenant.parent_name"><strong>{{ $t('tenants.list.parent_label') }}</strong> {{ tenant.parent_name }} <br></span>
        <span v-else><strong>{{ $t('tenants.list.parent_label') }}</strong> {{ $t('tenants.list.parent_none') }} <br></span>
        <strong>{{ $t('tenants.list.created_label') }}</strong> {{ new Date(tenant.created_at).toLocaleDateString() }}
      </li>
    </ul>

    <br>
    <NuxtLink to="/dashboard">{{ $t('tenants.back_to_dashboard') }}</NuxtLink>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

const router = useRouter();
const { t } = useI18n();

const tenantName = ref('');
const tenantType = ref('');
const parentId = ref('');
const successMessage = ref('');
const errorMessage = ref('');

const tenants = ref([]);
const loadingTenants = ref(true);
const tenantsError = ref('');

const checkAuthAndFetchTenants = async () => {
  const authToken = localStorage.getItem('authToken');
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

  if (!authToken || !currentUser || !currentUser.is_global_super_admin) {
    errorMessage.value = 'Access Denied: Only Global Super Admins can manage tenants. Please log in.';
    router.push('/login');
    return;
  }

  await fetchTenants(authToken);
};

const createTenant = async () => {
  successMessage.value = '';
  errorMessage.value = '';

  const authToken = localStorage.getItem('authToken');
  if (!authToken) {
    errorMessage.value = t('tenants.messages.error_auth', { message: 'Not authenticated. Please log in.' });
    router.push('/login');
    return;
  }

  const payload = {
    name: tenantName.value,
    type: tenantType.value,
  };

  if (parentId.value) {
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    if (!uuidRegex.test(parentId.value)) {
        errorMessage.value = t('tenants.messages.error_input', { message: 'Invalid Parent ID format. Must be a valid UUID.' });
        return;
    }
    payload.parent_id = parentId.value;
  }

  try {
    const response = await axios.post('http://localhost:8080/api/tenants', payload, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    successMessage.value = t('tenants.messages.success', { name: response.data.name, id: response.data.id });
    tenantName.value = '';
    tenantType.value = '';
    parentId.value = '';

    await fetchTenants(authToken);

  } catch (error) {
    console.error('Error creating tenant:', error);
    if (error.response) {
      if (error.response.status === 401 || error.response.status === 403) {
        errorMessage.value = t('tenants.messages.error_auth', { message: error.response.data || 'You are not authorized to perform this action.' });
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        router.push('/login');
      } else if (error.response.status === 400) {
        errorMessage.value = t('tenants.messages.error_input', { message: error.response.data });
      } else {
        errorMessage.value = t('tenants.messages.error_server', { message: error.response.data || 'Could not create tenant.' });
      }
    } else {
      errorMessage.value = t('tenants.messages.error_network');
    }
  }
};

const fetchTenants = async (token) => {
  loadingTenants.value = true;
  tenantsError.value = '';
  try {
    const response = await axios.get('http://localhost:8080/api/tenants', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    tenants.value = response.data;
  } catch (error) {
    console.error('Error fetching tenants:', error);
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      tenantsError.value = t('tenants.messages.error_auth', { message: error.response.data || 'Please log in again.' });
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      router.push('/login');
    } else {
      tenantsError.value = t('tenants.messages.error_network');
    }
  } finally {
    loadingTenants.value = false;
  }
};

onMounted(() => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser || !currentUser.is_global_super_admin) {
    router.push('/dashboard');
    alert(t('tenants.messages.access_denied')); 
  } else {
    checkAuthAndFetchTenants();
  }
});
</script>

<style scoped>
.tenant-management-container {
  max-width: 800px;
  margin: 50px auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  background-color: #f9f9f9;
}

.tenant-form {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input[type="text"] {
  width: calc(100% - 20px);
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  background-color: #28a745;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  margin-right: 10px;
}

button:hover {
  background-color: #218838;
}

.success-message {
  color: green;
  margin-top: 15px;
}

.error-message {
  color: red;
  margin-top: 15px;
}

hr {
  margin: 30px 0;
  border: 0;
  border-top: 1px solid #eee;
}

.tenant-list {
  list-style: none;
  padding: 0;
}

.tenant-item {
  background-color: #e9ecef;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 5px;
  border: 1px solid #dee2e6;
}
</style>
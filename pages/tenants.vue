<template>
  <div class="tenant-management-container">
    <h1>Tenant Management</h1>

    <h2>Create New Tenant</h2>
    <form @submit.prevent="createTenant" class="tenant-form">
      <div class="form-group">
        <label for="tenantName">Tenant Name:</label>
        <input type="text" id="tenantName" v-model="tenantName" required>
      </div>

      <div class="form-group">
        <label for="tenantType">Tenant Type:</label>
        <input type="text" id="tenantType" v-model="tenantType" required placeholder="e.g., Main, Branch">
      </div>

      <div class="form-group">
        <label for="parentId">Parent ID (Optional UUID):</label>
        <input type="text" id="parentId" v-model="parentId" placeholder="e.g., a1b2c3d4-e5f6-7890-1234-567890abcdef">
      </div>

      <button type="submit">Create Tenant</button>
    </form>

    <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

    <hr>

    <h2>Existing Tenants</h2>
    <p v-if="loadingTenants">Loading tenants...</p>
    <p v-else-if="tenantsError" class="error-message">{{ tenantsError }}</p>
    <div v-else-if="tenants.length === 0">
      <p>No tenants created yet.</p>
    </div>
    <ul v-else class="tenant-list">
      <li v-for="tenant in tenants" :key="tenant.id" class="tenant-item">
        <strong>Name:</strong> {{ tenant.name }} <br>
        <strong>Type:</strong> {{ tenant.type }} <br>
        <strong>ID:</strong> {{ tenant.id }} <br>
        <span v-if="tenant.parent_name"><strong>Parent:</strong> {{ tenant.parent_name }} <br></span>
        <span v-else><strong>Parent:</strong> (None) <br></span>
        <strong>Created:</strong> {{ new Date(tenant.created_at).toLocaleDateString() }}
      </li>
    </ul>

    <br>
    <NuxtLink to="/dashboard">Back to Dashboard</NuxtLink>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();

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
      tenantsError.value = `Authorization error: ${error.response.data || 'Please log in again.'}`;
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      router.push('/login');
    } else {
      tenantsError.value = 'Failed to load tenants. Please try again later.';
    }
  } finally {
    loadingTenants.value = false;
  }
};

const createTenant = async () => {
  successMessage.value = '';
  errorMessage.value = '';

  const authToken = localStorage.getItem('authToken');
  if (!authToken) {
    errorMessage.value = 'Not authenticated. Please log in.';
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
      errorMessage.value = 'Invalid Parent ID format. Must be a valid UUID.';
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

    successMessage.value = `Tenant '${response.data.name}' (ID: ${response.data.id}) created successfully!`;
    tenantName.value = '';
    tenantType.value = '';
    parentId.value = '';

    await fetchTenants(authToken);

  } catch (error) {
    console.error('Error creating tenant:', error);
    if (error.response) {
      if (error.response.status === 401 || error.response.status === 403) {
        errorMessage.value = `Authentication Error: ${error.response.data || 'You are not authorized to perform this action.'}`;
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        router.push('/login');
      } else if (error.response.status === 400) {
        errorMessage.value = `Invalid input: ${error.response.data}`;
      } else {
        errorMessage.value = `Server Error: ${error.response.data || 'Could not create tenant.'}`;
      }
    } else {
      errorMessage.value = 'Network Error: Could not reach the backend.';
    }
  }
};

onMounted(() => {
  checkAuthAndFetchTenants();
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
<template>
  <div class="env-debug">
    <h2>Переменные окружения:</h2>
    <pre>{{ envVars }}</pre>
    <p><strong>VITE_SHEET_SCRIPT_URL:</strong> {{ scriptUrl || 'Не установлено' }}</p>
  </div>
</template>

<script>
export default {
  name: 'EnvDebug',
  data() {
    return {
      envVars: JSON.stringify(import.meta.env, null, 2),
      scriptUrl: import.meta.env.VITE_SHEET_SCRIPT_URL
    };
  }
};
</script>

<style scoped>
.env-debug {
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 8px;
  margin: 20px 0;
}
pre {
  white-space: pre-wrap;
  word-break: break-all;
}
</style>

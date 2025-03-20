<template>
  <div class="space-y-4">
    <!-- NO Document опция -->
    <div v-if="showNoOption" class="flex items-center space-x-3">
      <input
        :id="'no-' + id"
        type="checkbox"
        v-model="noDocument"
        class="h-4 w-4 rounded border-gray-700 bg-gray-800 text-toda-primary focus:ring-toda-primary"
      >
      <label :for="'no-' + id" class="text-gray-300">NO</label>
    </div>

    <!-- Область загрузки файлов -->
    <div
      v-if="!noDocument"
      class="relative border-2 border-dashed border-gray-700 rounded-lg p-6"
      :class="{ 'border-toda-primary bg-toda-primary bg-opacity-5': isDragging }"
      @dragenter.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @dragover.prevent
      @drop.prevent="handleDrop"
    >
      <!-- Инпут для файлов (скрытый) -->
      <input
        :id="id"
        type="file"
        :multiple="multiple"
        class="hidden"
        @change="handleFileSelect"
        :accept="accept"
      >

      <!-- Область для перетаскивания -->
      <label
        :for="id"
        class="flex flex-col items-center justify-center cursor-pointer"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <span class="text-gray-300">Drag files here or</span>
        <span class="text-toda-primary">click to select</span>
        <span v-if="maxFiles" class="text-sm text-gray-400 mt-2">
          Максимум файлов: {{ maxFiles }}
        </span>
      </label>
    </div>

    <!-- Список загруженных файлов -->
    <div v-if="modelValue.length > 0" class="space-y-2">
      <div
        v-for="(file, index) in modelValue"
        :key="index"
        class="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
      >
        <div class="flex items-center space-x-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span class="text-gray-300 truncate max-w-xs">{{ file.name }}</span>
        </div>
        <button
          @click="removeFile(index)"
          class="text-gray-400 hover:text-red-500 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Поле для комментария -->
    <div v-if="showComment" class="space-y-2">
      <label :for="'comment-' + id" class="block text-gray-300 text-sm">
        Комментарий
      </label>
      <textarea
        :id="'comment-' + id"
        v-model="comment"
        rows="3"
        class="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-toda-primary"
      ></textarea>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'

const props = defineProps({
  modelValue: {
    type: Array,
    required: true
  },
  id: {
    type: String,
    required: true
  },
  multiple: {
    type: Boolean,
    default: true
  },
  maxFiles: {
    type: Number,
    default: null
  },
  accept: {
    type: String,
    default: '*'
  },
  showNoOption: {
    type: Boolean,
    default: false
  },
  noDocumentValue: {
    type: Boolean,
    default: false
  },
  showComment: {
    type: Boolean,
    default: false
  },
  commentValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'update:noDocument', 'update:comment'])

const isDragging = ref(false)
const noDocument = ref(props.noDocumentValue)
const comment = ref(props.commentValue)

watch(noDocument, (newValue) => {
  emit('update:noDocument', newValue)
  if (newValue) {
    emit('update:modelValue', [])
  }
})

watch(comment, (newValue) => {
  emit('update:comment', newValue)
})

function handleDrop(e) {
  isDragging.value = false
  const files = Array.from(e.dataTransfer.files)
  addFiles(files)
}

function handleFileSelect(e) {
  const files = Array.from(e.target.files)
  addFiles(files)
  e.target.value = '' // Сброс input для возможности повторной загрузки того же файла
}

function addFiles(files) {
  if (props.maxFiles && props.modelValue.length + files.length > props.maxFiles) {
    // Можно добавить toast уведомление здесь
    return
  }
  
  const newFiles = [...props.modelValue]
  files.forEach(file => {
    // Сохраняем оригинальный файл для последующей загрузки
    newFiles.push({
      name: file.name,
      size: file.size,
      type: file.type,
      file: file, // Сохраняем оригинальный файл
      url: URL.createObjectURL(file)
    })
  })
  
  emit('update:modelValue', newFiles)
}

function removeFile(index) {
  const newFiles = [...props.modelValue]
  // Освобождаем URL перед удалением файла
  if (newFiles[index].url) {
    URL.revokeObjectURL(newFiles[index].url)
  }
  newFiles.splice(index, 1)
  emit('update:modelValue', newFiles)
}

// Очистка URL при размонтировании компонента
onBeforeUnmount(() => {
  props.modelValue.forEach(file => {
    if (file.url) {
      URL.revokeObjectURL(file.url)
    }
  })
})
</script>

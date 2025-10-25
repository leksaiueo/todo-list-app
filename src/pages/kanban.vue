<template>
  <div id="app">
    <div class="app-container text-white p-6">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="flex items-center gap-4 mb-6">
          <router-link to="/" class="flex items-center gap-2 text-gray-400">
            <span class="material-icons">home</span>
            <p class="font-semibold">Main Table</p>
          </router-link>
          <router-link
            to="/kanban"
            class="flex items-center gap-2 text-gray-400"
          >
            <p class="font-semibold">Kanban</p>
          </router-link>
        </div>

        <!-- Toolbar -->
        <div class="flex items-center gap-3 mb-6 flex-wrap">
          <button
            v-on:click="showModal = true"
            class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium"
          >
            New task
            <span>▼</span>
          </button>

          <div class="relative">
            <input
              type="text"
              placeholder="🔍 Search"
              v-model="searchQuery"
              class="bg-gray-800 text-white pl-4 pr-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div class="relative">
            <button
              v-on:click="showDeveloperFilter = !showDeveloperFilter"
              class="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 flex items-center gap-2 hover:bg-gray-700"
            >
              👤 Person
            </button>
            <div
              v-if="showDeveloperFilter"
              class="absolute top-12 left-0 bg-gray-800 border border-gray-700 rounded-lg p-2 z-10 min-w-[150px]"
            >
              <div
                v-on:click="selectDeveloper('')"
                class="px-3 py-2 hover:bg-gray-700 cursor-pointer rounded text-sm"
              >
                All
              </div>
              <div
                v-for="dev in allDevelopers"
                v-bind:key="dev"
                v-on:click="selectDeveloper(dev)"
                class="px-3 py-2 hover:bg-gray-700 cursor-pointer rounded text-sm"
              >
                {{ dev }}
              </div>
            </div>
          </div>

          <div class="relative">
            <button
              v-on:click="showSortMenu = !showSortMenu"
              class="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 flex items-center gap-2 hover:bg-gray-700"
            >
              ⇅ Sort
            </button>
            <div
              v-if="showSortMenu"
              class="absolute top-12 left-0 bg-gray-800 border border-gray-700 rounded-lg p-2 z-10 min-w-[180px]"
            >
              <div
                v-for="key in ['task', 'priority', 'type', 'date']"
                v-bind:key="key"
                v-on:click="toggleSort(key)"
                class="px-3 py-2 hover:bg-gray-700 cursor-pointer rounded text-sm flex justify-between items-center"
              >
                <span class="capitalize">{{ key }}</span>
                <span v-if="getSortConfig(key)" class="text-blue-400">{{
                  getSortConfig(key).direction === "asc" ? "↑" : "↓"
                }}</span>
              </div>
            </div>
          </div>

          <!-- Status Legend -->
          <div class="flex gap-2 ml-auto">
            <div class="w-12 h-8 bg-blue-500 rounded"></div>
            <div class="w-12 h-8 bg-orange-400 rounded"></div>
            <div class="w-12 h-8 bg-cyan-300 rounded"></div>
          </div>
        </div>

        <!-- Kanban Board -->
        <div class="grid grid-cols-4 gap-4">
          <div
            v-for="status in statusColumns"
            v-bind:key="status"
            class="flex flex-col"
          >
            <div
              v-bind:class="[
                statusColors[status],
                'rounded-t-lg p-3 text-white font-semibold flex items-center justify-between',
              ]"
            >
              <span>{{ status }} {{ getTaskCountByStatus(status) }}</span>
            </div>
            <div
              v-on:dragover.prevent="handleDragOver($event, status)"
              v-on:dragleave="handleDragLeave"
              v-on:drop="handleDrop($event, status)"
              class="bg-gray-700 bg-opacity-30 rounded-b-lg p-3 min-h-[500px] flex flex-col gap-3"
            >
              <div
                v-for="task in getTasksByStatus(status)"
                v-bind:key="task.id"
                draggable="true"
                v-on:dragstart="handleDragStart($event, task)"
                v-on:dragend="handleDragEnd"
                class="bg-gray-800 rounded-lg p-4 cursor-move hover:bg-gray-750 transition-colors"
              >
                <h3 class="text-white font-medium mb-3">{{ task.task }}</h3>
                <div class="flex flex-wrap gap-2 mb-3">
                  <span
                    v-bind:class="[
                      priorityColors[task.priority],
                      'text-white px-2 py-1 rounded text-xs',
                    ]"
                  >
                    {{ task.priority }}
                  </span>
                  <span class="text-gray-400 text-xs px-2 py-1"
                    >{{ task.estimatedSP }} SP</span
                  >
                  <span
                    v-bind:class="[
                      typeColors[task.type],
                      'text-gray-800 px-2 py-1 rounded text-xs',
                    ]"
                  >
                    {{ task.type }}
                  </span>
                </div>
                <div class="flex items-center gap-2">
                  <div
                    v-if="task.developers.length === 0"
                    class="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center"
                  >
                    <span class="text-gray-400 text-xs">👤</span>
                  </div>
                  <div
                    v-for="(dev, idx) in task.developers"
                    v-bind:key="idx"
                    class="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-xs font-semibold"
                  >
                    {{ getInitials(dev) }}
                  </div>
                  <span class="text-gray-500 ml-auto">💬</span>
                  <span class="text-gray-500">📋</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal -->
        <div
          v-if="showModal"
          class="fixed inset-0 modal-overlay flex items-center justify-center z-50"
          v-on:click.self="closeModal"
        >
          <div class="bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-2xl font-bold text-white">New Task</h2>
              <button
                v-on:click="closeModal"
                class="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <form v-on:submit.prevent="saveTask" class="space-y-4">
              <div>
                <label class="block text-gray-300 mb-2">Task Name</label>
                <input
                  type="text"
                  v-model="formData.task"
                  required
                  class="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label class="block text-gray-300 mb-2">Developer</label>
                <input
                  type="text"
                  v-model="formData.developer"
                  placeholder="Enter developer name"
                  class="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-gray-300 mb-2">Status</label>
                  <select
                    v-model="formData.status"
                    class="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                  >
                    <option
                      v-for="opt in statusOptions"
                      v-bind:key="opt"
                      v-bind:value="opt"
                    >
                      {{ opt }}
                    </option>
                  </select>
                </div>

                <div>
                  <label class="block text-gray-300 mb-2">Priority</label>
                  <select
                    v-model="formData.priority"
                    class="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                  >
                    <option
                      v-for="opt in priorityOptions"
                      v-bind:key="opt"
                      v-bind:value="opt"
                    >
                      {{ opt }}
                    </option>
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-gray-300 mb-2">Type</label>
                  <select
                    v-model="formData.type"
                    class="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                  >
                    <option
                      v-for="opt in typeOptions"
                      v-bind:key="opt"
                      v-bind:value="opt"
                    >
                      {{ opt }}
                    </option>
                  </select>
                </div>

                <div>
                  <label class="block text-gray-300 mb-2">Date</label>
                  <input
                    type="date"
                    v-model="formData.date"
                    class="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-gray-300 mb-2">Estimated SP</label>
                  <input
                    type="number"
                    v-model.number="formData.estimatedSP"
                    class="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label class="block text-gray-300 mb-2">Actual SP</label>
                  <input
                    type="number"
                    v-model.number="formData.actualSP"
                    class="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div class="flex gap-3 pt-4">
                <button
                  type="submit"
                  class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium"
                >
                  Save Task
                </button>
                <button
                  type="button"
                  v-on:click="closeModal"
                  class="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import person from "../data/person.json";

const tasks = ref(
  person.data.map((task, index) => ({
    id: index + 1,
    task: task.title,
    developers: task.developer
      ? task.developer.split(", ").filter((name) => name.trim())
      : [],
    status: task.status,
    priority: task.priority,
    type: task.type,
    date: new Date().toISOString().split("T")[0], // Set to today's date
    estimatedSP: task["Estimated SP"] || 0,
    actualSP: task["Actual SP"] || 0,
  }))
);
const searchQuery = ref("");
const selectedDeveloper = ref("");
const sortConfig = ref({});
const showDeveloperFilter = ref(false);
const showSortMenu = ref(false);
const showModal = ref(false);
const draggedTask = ref(null);
const formData = ref({
  task: "",
  developer: "",
  status: "Ready to start",
  priority: "Medium",
  type: "Feature Enhancements",
  date: new Date().toISOString().split("T")[0],
  estimatedSP: 0,
  actualSP: 0,
});
const statusColumns = ref([
  "Ready to start",
  "In Progress",
  "Waiting for review",
  "Done",
]);
const statusOptions = ref([
  "Ready to start",
  "In Progress",
  "Waiting for review",
  "Pending Deploy",
  "Done",
  "Stuck",
]);
const priorityOptions = ref([
  "Critical",
  "High",
  "Medium",
  "Low",
  "Best Effort",
]);
const typeOptions = ref(["Feature Enhancements", "Other", "Bug"]);
const statusColors = ref({
  "Ready to start": "bg-blue-500",
  "In Progress": "bg-orange-400",
  "Waiting for review": "bg-cyan-300",
  "Pending Deploy": "bg-yellow-400",
  Done: "bg-green-500",
  Stuck: "bg-red-500",
});
const priorityColors = ref({
  Critical: "bg-red-600",
  High: "bg-purple-600",
  Medium: "bg-teal-400",
  Low: "bg-blue-400",
  "Best Effort": "bg-gray-400",
});
const typeColors = ref({
  "Feature Enhancements": "bg-pink-300",
  Other: "bg-purple-300",
  Bug: "bg-red-400",
});

const allDevelopers = computed(() => {
  const devs = new Set();
  tasks.value.forEach((task) => {
    task.developers.forEach((dev) => devs.add(dev));
  });
  return Array.from(devs).sort();
});

const filteredTasks = computed(() => {
  let filtered = tasks.value.filter((task) => {
    const matchesSearch = task.task
      .toLowerCase()
      .includes(searchQuery.value.toLowerCase());
    const matchesDeveloper =
      !selectedDeveloper.value ||
      task.developers.includes(selectedDeveloper.value);
    return matchesSearch && matchesDeveloper;
  });

  // Apply sorting
  for (const [key, config] of Object.entries(sortConfig.value)) {
    if (config.direction) {
      filtered.sort((a, b) => {
        let aVal = a[key];
        let bVal = b[key];
        if (key === "date") {
          aVal = new Date(aVal);
          bVal = new Date(bVal);
        }
        if (config.direction === "asc") {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });
    }
  }

  return filtered;
});

const getTasksByStatus = (status) => {
  return filteredTasks.value.filter((task) => task.status === status);
};

const getTaskCountByStatus = (status) => {
  return getTasksByStatus(status).length;
};

const getInitials = (name) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

const selectDeveloper = (dev) => {
  selectedDeveloper.value = dev;
  showDeveloperFilter.value = false;
};

const toggleSort = (key) => {
  if (!sortConfig.value[key]) {
    sortConfig.value[key] = { direction: "asc" };
  } else if (sortConfig.value[key].direction === "asc") {
    sortConfig.value[key].direction = "desc";
  } else {
    delete sortConfig.value[key];
  }
  showSortMenu.value = false;
};

const getSortConfig = (key) => {
  return sortConfig.value[key];
};

const handleDragStart = (event, task) => {
  draggedTask.value = task;
  event.target.classList.add("dragging");
};

const handleDragEnd = (event) => {
  event.target.classList.remove("dragging");
  draggedTask.value = null;
};

const handleDragOver = (event, status) => {
  event.preventDefault();
  event.currentTarget.classList.add("drag-over");
};

const handleDragLeave = (event) => {
  event.currentTarget.classList.remove("drag-over");
};

const handleDrop = (event, newStatus) => {
  event.preventDefault();
  event.currentTarget.classList.remove("drag-over");

  if (draggedTask.value) {
    draggedTask.value.status = newStatus;
  }
};

const closeModal = () => {
  showModal.value = false;
  resetForm();
};

const resetForm = () => {
  formData.value = {
    task: "",
    developer: "",
    status: "Ready to start",
    priority: "Medium",
    type: "Feature Enhancements",
    date: new Date().toISOString().split("T")[0],
    estimatedSP: 0,
    actualSP: 0,
  };
};

const saveTask = () => {
  const newTask = {
    id: Date.now(),
    task: formData.value.task,
    developers: formData.value.developer ? [formData.value.developer] : [],
    status: formData.value.status,
    priority: formData.value.priority,
    type: formData.value.type,
    date: formData.value.date,
    estimatedSP: formData.value.estimatedSP,
    actualSP: formData.value.actualSP,
  };
  tasks.value.unshift(newTask);
  closeModal();
};
</script>
<style></style>

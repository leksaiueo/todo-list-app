<template>
  <div id="app">
    <div class="app-container text-white p-6">
      <div class="max-w-7xl mx-auto">
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

        <div class="flex items-center gap-3 mb-6 flex-wrap">
          <button
            v-on:click="addNewTask"
            class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium"
          >
            New Task
            <span class="material-icons pl-2">add</span>
          </button>

          <div class="relative">
            <input
              type="text"
              placeholder="Search Task"
              v-model="searchQuery"
              class="bg-gray-800 text-white pl-4 pr-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500"
            />
            <!-- <span class="material-icons">search</span> -->
          </div>

          <div class="relative">
            <!-- person develop -->
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
                v-for="dev in allDeveloper"
                v-bind:key="dev"
                v-on:click="selectDeveloper(dev)"
                class="px-3 py-2 hover:bg-gray-700 cursor-pointer rounded text-sm"
              >
                {{ dev }}
              </div>
            </div>

            <!--sort buttion -->
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
                v-for="key in ['title', 'status', 'priority', 'type', 'date']"
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

          <!-- tables -->
          <div class="table-container rounded-lg overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gray-800 border-b border-gray-700">
                  <tr>
                    <th
                      class="px-4 py-3 text-center text-gray-400 font-lg text-md w-12 table-fixed"
                    >
                      <input type="checkbox" class="rounded" />
                    </th>
                    <th
                      class="px-4 py-3 text-center text-gray-400 font-lg text-md"
                    >
                      Task
                    </th>
                    <th
                      class="px-4 py-3 text-center text-gray-400 font-lg text-md"
                    >
                      Developer
                    </th>
                    <th
                      class="px-4 py-3 text-center text-gray-400 font-lg text-md"
                    >
                      Status
                    </th>
                    <th
                      class="px-4 py-3 text-center text-gray-400 font-lg text-md"
                    >
                      Priority
                    </th>
                    <th
                      class="px-4 py-3 text-center text-gray-400 font-lg text-md"
                    >
                      Type
                    </th>
                    <th
                      class="px-4 py-3 text-center text-gray-400 font-lg text-md"
                    >
                      Date
                    </th>
                    <th
                      class="px-4 py-3 text-center text-gray-400 font-lg text-md"
                    >
                      Estimated SP
                    </th>
                    <th
                      class="px-4 py-3 text-center text-gray-400 font-lg text-md"
                    >
                      Actual SP
                    </th>
                    <th
                      class="px-4 py-3 text-center text-gray-400 font-lg text-md"
                    >
                      Delete
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="title in filteredtitles"
                    v-bind:key="title.id"
                    class="border-b border-gray-700"
                  >
                    <td class="px-4 py-3">
                      <input type="checkbox" class="rounded" />
                    </td>
                    <td class="px-4 py-3">
                      <input
                        v-if="
                          editingCell &&
                          editingCell.id === title.id &&
                          editingCell.field === 'title'
                        "
                        type="text"
                        v-model="title.title"
                        v-on:blur="stopEditing"
                        v-on:keyup.enter="stopEditing"
                        class="bg-gray-700 text-white px-2 py-1 rounded text-sm w-full"
                      />
                      <div
                        v-else
                        v-on:click="startEditing(title.id, 'title')"
                        class="text-gray-300 text-sm cursor-pointer"
                      >
                        {{ title.title }}
                      </div>
                    </td>
                    <td class="px-4 py-3">
                      <div class="flex gap-1 items-center">
                        <div
                          v-if="
                            title.developer.length === 0 &&
                            !(
                              editingCell &&
                              editingCell.id === title.id &&
                              editingCell.field === 'developer'
                            )
                          "
                          v-on:click="startEditing(title.id, 'developer')"
                          class="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center cursor-pointer"
                        >
                          <span class="text-gray-400">👤</span>
                        </div>
                        <div
                          v-if="
                            !(
                              editingCell &&
                              editingCell.id === title.id &&
                              editingCell.field === 'developer'
                            )
                          "
                          v-for="(dev, idx) in title.developer"
                          v-bind:key="idx"
                          v-on:click="startEditing(title.id, 'developer')"
                          class="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-xs font-semibold cursor-pointer"
                          v-bind:title="dev"
                        >
                          {{ getInitials(dev) }}
                        </div>
                        <div
                          v-if="
                            editingCell &&
                            editingCell.id === title.id &&
                            editingCell.field === 'developer'
                          "
                          class="flex flex-col gap-1"
                        >
                          <div
                            v-for="(dev, idx) in title.developer"
                            v-bind:key="idx"
                            class="flex items-center gap-1"
                          >
                            <input
                              type="text"
                              v-model="title.developer[idx]"
                              class="bg-gray-700 text-white px-2 py-1 rounded text-sm w-20"
                              v-on:blur="stopEditing"
                              v-on:keyup.enter="stopEditing"
                            />
                            <button
                              v-on:click="removeDeveloper(title, idx)"
                              class="text-red-500 hover:text-red-700 text-sm"
                            >
                              ✕
                            </button>
                          </div>
                          <input
                            type="text"
                            v-on:keyup.enter="addDeveloper(title, $event)"
                            v-on:blur="stopEditing"
                            placeholder="Add new developer"
                            class="bg-gray-700 text-white px-2 py-1 rounded text-sm w-32"
                          />
                        </div>
                      </div>
                    </td>
                    <td class="px-4 py-3">
                      <select
                        v-if="
                          editingCell &&
                          editingCell.id === title.id &&
                          editingCell.field === 'status'
                        "
                        v-model="title.status"
                        v-on:blur="stopEditing"
                        v-on:change="stopEditing"
                        class="bg-gray-700 text-white px-2 py-1 rounded w-full text-sm"
                      >
                        <option
                          v-for="opt in statusOptions"
                          v-bind:key="opt"
                          v-bind:value="opt"
                        >
                          {{ opt }}
                        </option>
                      </select>
                      <div
                        v-else
                        v-on:click="startEditing(title.id, 'status')"
                        v-bind:class="[
                          statusColors[title.status],
                          'text-white px-3 py-1 rounded text-sm text-center cursor-pointer',
                        ]"
                      >
                        {{ title.status }}
                      </div>
                    </td>
                    <td class="px-4 py-3">
                      <select
                        v-if="
                          editingCell &&
                          editingCell.id === title.id &&
                          editingCell.field === 'priority'
                        "
                        v-model="title.priority"
                        v-on:blur="stopEditing"
                        v-on:change="stopEditing"
                        class="bg-gray-700 text-white px-2 py-1 rounded w-full text-sm"
                      >
                        <option
                          v-for="opt in priorityOptions"
                          v-bind:key="opt"
                          v-bind:value="opt"
                        >
                          {{ opt }}
                        </option>
                      </select>
                      <div
                        v-else
                        v-on:click="startEditing(title.id, 'priority')"
                        v-bind:class="[
                          priorityColors[title.priority],
                          'text-white px-3 py-1 rounded text-sm text-center cursor-pointer',
                        ]"
                      >
                        {{ title.priority }}
                      </div>
                    </td>
                    <td class="px-4 py-3">
                      <select
                        v-if="
                          editingCell &&
                          editingCell.id === title.id &&
                          editingCell.field === 'type'
                        "
                        v-model="title.type"
                        v-on:blur="stopEditing"
                        v-on:change="stopEditing"
                        class="bg-gray-700 text-white px-2 py-1 rounded w-full text-sm"
                      >
                        <option
                          v-for="opt in typeOptions"
                          v-bind:key="opt"
                          v-bind:value="opt"
                        >
                          {{ opt }}
                        </option>
                      </select>
                      <div
                        v-else
                        v-on:click="startEditing(title.id, 'type')"
                        v-bind:class="[
                          typeColors[title.type],
                          ' text-white px-3 py-1 rounded text-sm text-center cursor-pointer',
                        ]"
                      >
                        {{ title.type }}
                      </div>
                    </td>
                    <td class="px-4 py-3">
                      <input
                        v-if="
                          editingCell &&
                          editingCell.id === title.id &&
                          editingCell.field === 'date'
                        "
                        type="date"
                        v-model="title.date"
                        v-on:blur="stopEditing"
                        v-on:change="stopEditing"
                        class="bg-gray-700 text-white px-2 py-1 rounded text-sm w-full"
                      />
                      <div
                        v-else
                        v-on:click="startEditing(title.id, 'date')"
                        class="text-gray-300 text-sm cursor-pointer"
                      >
                        {{ formatDate(title.date) }}
                      </div>
                    </td>
                    <td class="px-4 py-3">
                      <input
                        v-if="
                          editingCell &&
                          editingCell.id === title.id &&
                          editingCell.field === 'estimatedSP'
                        "
                        type="number"
                        v-model.number="title.estimatedSP"
                        v-on:blur="stopEditing"
                        v-on:keyup.enter="stopEditing"
                        class="bg-gray-700 text-white px-2 py-1 rounded text-sm w-full"
                      />
                      <div
                        v-else
                        v-on:click="startEditing(title.id, 'estimatedSP')"
                        class="text-gray-300 text-sm cursor-pointer"
                      >
                        {{ title.estimatedSP }} SP
                      </div>
                    </td>
                    <td class="px-4 py-3">
                      <input
                        v-if="
                          editingCell &&
                          editingCell.id === title.id &&
                          editingCell.field === 'actualSP'
                        "
                        type="number"
                        v-model.number="title.actualSP"
                        v-on:blur="stopEditing"
                        v-on:keyup.enter="stopEditing"
                        class="bg-gray-700 text-white px-2 py-1 rounded text-sm w-full"
                      />
                      <div
                        v-else
                        v-on:click="startEditing(title.id, 'actualSP')"
                        class="text-gray-300 text-sm cursor-pointer"
                      >
                        {{ title.actualSP }} SP
                      </div>
                    </td>
                    <td class="px-4 py-3">
                      <button
                        v-on:click="deleteTask(title.id)"
                        class="text-red-500 hover:text-red-700 text-sm cursor-pointer"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>

              <!-- STATUS TODOLIST -->
              <div class="grid grid-cols-4 gap-10 p-6 border-t border-gray-700">
                <div>
                  <div class="flex gap-1 h-8 w-full rounded-lg">
                    <div
                      v-for="(percentageItem, idx) in statusPercentages"
                      v-bind:key="idx"
                      v-bind:class="percentageItem.color"
                      v-bind:style="{
                        width: percentageItem.percentage + '%',
                      }"
                      class="flex items-center justify-center text-white text-xs font-semibold"
                    >
                      {{ Math.round(percentageItem.percentage) }}%
                    </div>
                  </div>
                  <div class="text-xs text-gray-400 mt-1">
                    {{ totalPercentage(statusPercentages) }}% sum
                  </div>
                </div>
                <div>
                  <div class="flex gap-1 h-8 w-full">
                    <div
                      v-for="(priorityItem, idx) in priorityPercentages"
                      v-bind:key="idx"
                      v-bind:class="priorityItem.color"
                      v-bind:style="{ width: priorityItem.percentage + '%' }"
                      class="flex items-center justify-center text-white text-xs font-semibold"
                    >
                      {{ Math.round(priorityItem.percentage) }}%
                    </div>
                  </div>
                  <div class="text-xs text-gray-400 mt-1">
                    {{ totalPercentage(priorityPercentages) }}% sum
                  </div>
                </div>
                <div>
                  <div class="flex gap-1 h-8 w-full">
                    <div
                      v-for="(typeItem, idx) in typePercentages"
                      v-bind:key="idx"
                      v-bind:class="typeItem.color"
                      v-bind:style="{ width: typeItem.percentage + '%' }"
                      class="flex items-center justify-center text-white text-xs font-semibold"
                    >
                      {{ Math.round(typeItem.percentage) }}%
                    </div>
                  </div>
                  <div class="text-xs text-gray-400 mt-1">
                    {{ totalPercentage(typePercentages) }}% sum
                  </div>
                </div>
                <div class="flex gap-2">
                  <div class="flex-1 text-center">
                    <div class="text-sm">{{ totalEstimatedSP }} SP</div>
                    <div class="text-xs text-gray-400">sum</div>
                  </div>
                  <div class="flex-1 text-center">
                    <div class="text-sm">{{ totalActualSP }} SP</div>
                    <div class="text-xs text-gray-400">sum</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- modal tambah task -->
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
                  v-model="formData.title"
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

const searchQuery = ref("");
const showDeveloperFilter = ref(false);
const showSortMenu = ref(false);
const showModal = ref(false);
const editingCell = ref(null);
const formData = ref({
  title: "",
  developer: "",
  status: "Ready to start",
  priority: "Medium",
  type: "Feature Enhancements",
  date: new Date().toISOString().split("T")[0],
  estimatedSP: 0,
  actualSP: 0,
});
const titles = ref(
  person.data.map((task, index) => ({
    id: index + 1,
    title: task.title,
    developer: task.developer
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
const allDeveloper = computed(() => {
  const devs = new Set();
  titles.value.forEach((title) => {
    title.developer.forEach((dev) => devs.add(dev));
  });
  return Array.from(devs).sort();
});
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
const typeOptions = ref(["Bug", "Feature Enhancements", "Other"]);
const statusColors = ref({
  "Ready to start": "bg-blue-400",
  "In Progress": "bg-yellow-500",
  "Waiting for review": "bg-orange-400",
  "Pending Deploy": "bg-purple-500",
  Stuck: "bg-red-500",
  Done: "bg-green-500",
});
const priorityColors = ref({
  Critical: "bg-red-500",
  High: "bg-orange-500",
  Medium: "bg-purple-500",
  Low: "bg-blue-500",
  "Best Effort": "bg-green-500",
});
const typeColors = ref({
  Bug: "bg-red-500",
  "Feature Enhancements": "bg-blue-500",
  Other: "bg-green-500",
});
const sortConfig = ref({});

const filteredtitles = computed(() => {
  let filtered = titles.value.filter((title) => {
    const matchesSearch = title.title
      .toLowerCase()
      .includes(searchQuery.value.toLowerCase());
    const matchesDeveloper =
      !selectedDeveloper.value ||
      title.developer.includes(selectedDeveloper.value);
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

const selectedDeveloper = ref("");

const statusPercentages = computed(() => {
  const counts = {};
  titles.value.forEach((title) => {
    counts[title.status] = (counts[title.status] || 0) + 1;
  });
  const total = titles.value.length;
  return statusOptions.value
    .map((status) => ({
      status: status,
      color: statusColors.value[status],
      percentage: total > 0 ? ((counts[status] || 0) / total) * 100 : 0,
    }))
    .filter((item) => item.percentage > 0);
});

const priorityPercentages = computed(() => {
  const counts = {};
  titles.value.forEach((title) => {
    counts[title.priority] = (counts[title.priority] || 0) + 1;
  });
  const total = titles.value.length;
  return priorityOptions.value
    .map((priority) => ({
      priority: priority,
      color: priorityColors.value[priority],
      percentage: total > 0 ? ((counts[priority] || 0) / total) * 100 : 0,
    }))
    .filter((item) => item.percentage > 0);
});

const typePercentages = computed(() => {
  const counts = {};
  titles.value.forEach((title) => {
    counts[title.type] = (counts[title.type] || 0) + 1;
  });
  const total = titles.value.length;
  return typeOptions.value
    .map((type) => ({
      type: type,
      color: typeColors.value[type],
      percentage: total > 0 ? ((counts[type] || 0) / total) * 100 : 0,
    }))
    .filter((item) => item.percentage > 0);
});

const totalEstimatedSP = computed(() => {
  return titles.value.reduce((sum, title) => sum + (title.estimatedSP || 0), 0);
});

const totalActualSP = computed(() => {
  return titles.value.reduce((sum, title) => sum + (title.actualSP || 0), 0);
});

const totalPercentage = (percentages) => {
  return Math.round(
    percentages.reduce((sum, item) => sum + item.percentage, 0)
  );
};

const addNewTask = () => {
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  formData.value = {
    title: "",
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
  const newId = Math.max(...titles.value.map((t) => t.id), 0) + 1;
  const newTask = {
    id: newId,
    title: formData.value.title,
    developer: formData.value.developer ? [formData.value.developer] : [],
    status: formData.value.status,
    priority: formData.value.priority,
    type: formData.value.type,
    date: formData.value.date,
    estimatedSP: formData.value.estimatedSP,
    actualSP: formData.value.actualSP,
  };
  titles.value.push(newTask);
  closeModal();
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

const startEditing = (id, field) => {
  editingCell.value = { id, field };
};

const stopEditing = () => {
  editingCell.value = null;
};

const getInitials = (name) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString();
};

const addDeveloper = (title, event) => {
  const name = event.target.value.trim();
  if (name && !title.developer.includes(name)) {
    title.developer.push(name);
  }
  event.target.value = "";
  stopEditing();
};

const removeDeveloper = (title, idx) => {
  title.developer.splice(idx, 1);
};

const deleteTask = (id) => {
  const index = titles.value.findIndex((title) => title.id === id);
  if (index !== -1) {
    titles.value.splice(index, 1);
  }
};
</script>

<style></style>

<template>
  <div id="app">
    <div class="app-container text-white p-6">
      <div class="max-w-7xl mx-auto">
        <div class="flex items-center gap-4 mb-6">
          <div class="flex items-center gap-2 text-gray-400">
            <span class="material-icons">home</span>
            <p class="font-semibold">Main Table</p>
          </div>
          <div class="flex items-center gap-2 text-gray-400">
            <p class="font-semibold">Kanban</p>
            <span class="material-icons">add</span>
          </div>
        </div>

        <div class="flex items-center gap-3 mb-6 flex-wrap">
          <button
            v-on:click="addNewTask"
            class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium"
          >
            New Task
            <span class="material-icons">add</span>
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
          </div>

          <!--sort buttion -->
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
                  <th class="px-4 py-3 w-8">➕</th>
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
                        v-if="title.developer.length === 0"
                        v-on:click="startEditing(title.id, 'developer')"
                        class="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center cursor-pointer"
                      >
                        <span class="text-gray-400">👤</span>
                      </div>
                      <div
                        v-for="(dev, idx) in title.developer"
                        v-bind:key="idx"
                        v-on:click="startEditing(title.id, 'developer')"
                        class="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-xs font-semibold cursor-pointer"
                      >
                        {{ getInitials(dev) }}
                      </div>
                      <input
                        v-if="
                          editingCell &&
                          editingCell.id === title.id &&
                          editingCell.field === 'developer'
                        "
                        type="text"
                        v-on:keyup.enter="addDeveloper(title, $event)"
                        v-on:blur="stopEditing"
                        placeholder="Name"
                        class="ml-2 bg-gray-700 text-white px-2 py-1 rounded text-sm"
                      />
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
                        'text-gray-800 px-3 py-1 rounded text-sm text-center cursor-pointer',
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
                <tr>
                  <td colspan="11" class="px-4 py-2">
                    <button
                      v-on:click="addNewtitle"
                      class="text-gray-400 hover:text-white text-sm flex items-center gap-2"
                    >
                      <span>➕</span> Add Task
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- STATUS TODOLIST -->
        <div class="table-container rounded-lg overflow-hidden">
          <div class="overflow-x-auto grid-flow-col">
            <table class="w-full">
              <div class="grid grid-cols-5 gap-4 p-4 border-t border-gray-700">
                <div class="col-span-1"></div>
                <div>
                  <div class="flex gap-1 h-8 w-full rounded-lg">
                    <div
                      v-for="(percentageItem, idx) in statusPercentages"
                      v-bind:key="idx"
                      v-bind:class="percentageItem.color"
                      v-bind:style="{ width: percentageItem.percentage + '%' }"
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
                  <div class="flex-1 bg-gray-700 rounded h-8"></div>
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
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const searchQuery = ref("");
const showDeveloperFilter = ref(false);
const showSortMenu = ref(false);
const editingCell = ref(null);
const titles = ref([
  {
    id: 1,
    title: "Sample Task 1",
    developer: ["Alice", "Bob"],
    status: "In Progress",
    priority: "High",
    type: "Bug",
    date: "2023-10-01",
    estimatedSP: 5,
    actualSP: 3,
  },
  {
    id: 2,
    title: "Sample Task 2",
    developer: ["Charlie"],
    status: "Done",
    priority: "Medium",
    type: "Feature",
    date: "2023-10-05",
    estimatedSP: 8,
    actualSP: 8,
  },
  // Add more sample data as needed
]);
const allDeveloper = ref(["Alice", "Bob", "Charlie", "David"]);
const statusOptions = ref(["To Do", "In Progress", "Done"]);
const priorityOptions = ref(["Low", "Medium", "High"]);
const typeOptions = ref(["Bug", "Feature", "Enhancement"]);
const statusColors = ref({
  "To Do": "bg-gray-500",
  "In Progress": "bg-yellow-500",
  Done: "bg-green-500",
});
const priorityColors = ref({
  Low: "bg-blue-500",
  Medium: "bg-orange-500",
  High: "bg-red-500",
});
const typeColors = ref({
  Bug: "bg-red-200",
  Feature: "bg-blue-200",
  Enhancement: "bg-green-200",
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
  const newId = Math.max(...titles.value.map((t) => t.id), 0) + 1;
  titles.value.push({
    id: newId,
    title: "New Task",
    developer: [],
    status: "To Do",
    priority: "Medium",
    type: "Feature",
    date: new Date().toISOString().split("T")[0],
    estimatedSP: 0,
    actualSP: 0,
  });
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

const deleteTask = (id) => {
  const index = titles.value.findIndex((title) => title.id === id);
  if (index !== -1) {
    titles.value.splice(index, 1);
  }
};
</script>

<style></style>

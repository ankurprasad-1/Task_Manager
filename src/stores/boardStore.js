import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useBoardStore = defineStore('board', () => {
  const columns = ref([
    {
      id: 1,
      title: 'Ideas',
      notes: []
    },
    {
      id: 2,
      title: 'In Progress',
      notes: []
    },
    {
      id: 3,
      title: 'Done',
      notes: []
    }
  ])

  const addNote = (columnId, text) => {
    const column = columns.value.find(col => col.id === columnId)
    if (column) {
      column.notes.push({
        id: Date.now(),
        text
      })
    }
  }

  const deleteNote = (columnId, noteId) => {
    const column = columns.value.find(col => col.id === columnId)
    if (column) {
      column.notes = column.notes.filter(note => note.id !== noteId)
    }
  }

  const updateNote = (columnId, noteId, newText) => {
    const column = columns.value.find(col => col.id === columnId)
    if (column) {
      const note = column.notes.find(n => n.id === noteId)
      if (note) {
        note.text = newText
      }
    }
  }

  return {
    columns,
    addNote,
    deleteNote,
    updateNote
  }
})
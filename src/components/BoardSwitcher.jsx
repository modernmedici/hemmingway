import { useState } from 'react'
import { ChevronDown, Plus, Users, Trash2, Pencil } from 'lucide-react'

export default function BoardSwitcher({
  boards,
  activeBoardId,
  onSelectBoard,
  onCreateBoard,
  onUpdateBoard,
  onDeleteBoard,
  isOwner
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newBoardName, setNewBoardName] = useState('')
  const [editingBoardId, setEditingBoardId] = useState(null)
  const [editingBoardName, setEditingBoardName] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)

  const activeBoard = boards.find(b => b.id === activeBoardId)

  const handleCreateBoard = async (e) => {
    e.preventDefault()
    if (!newBoardName.trim()) return

    await onCreateBoard(newBoardName.trim())
    setNewBoardName('')
    setIsCreating(false)
  }

  const handleSelectBoard = (boardId) => {
    onSelectBoard(boardId)
    setIsOpen(false)
  }

  const handleStartEdit = (board, e) => {
    e.stopPropagation()
    setEditingBoardId(board.id)
    setEditingBoardName(board.name)
  }

  const handleSaveEdit = async (boardId) => {
    if (!editingBoardName.trim()) return
    await onUpdateBoard(boardId, editingBoardName.trim())
    setEditingBoardId(null)
    setEditingBoardName('')
  }

  const handleCancelEdit = () => {
    setEditingBoardId(null)
    setEditingBoardName('')
    setConfirmDelete(null)
  }

  const handleDelete = async (boardId) => {
    if (confirmDelete === boardId) {
      await onDeleteBoard(boardId)
      setConfirmDelete(null)
      setEditingBoardId(null)
      // If deleting active board, switch to first remaining board
      if (boardId === activeBoardId && boards.length > 1) {
        const remainingBoards = boards.filter(b => b.id !== boardId)
        if (remainingBoards[0]) {
          onSelectBoard(remainingBoards[0].id)
        }
      }
    } else {
      setConfirmDelete(boardId)
    }
  }

  return (
    <div className="relative">
      {/* Active board button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-md bg-card text-foreground transition-all duration-150 hover:shadow-[0_2px_6px_hsl(var(--foreground)/0.05)]"
        style={{
          boxShadow: '0 1px 3px hsl(var(--foreground) / 0.04)',
        }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="truncate text-sm font-serif font-bold">{activeBoard?.name || 'Loading...'}</span>
          {activeBoard?.members && activeBoard.members.length > 0 && (
            <Users size={12} className="text-muted-foreground/50 flex-shrink-0" />
          )}
        </div>
        <ChevronDown
          size={12}
          className="text-muted-foreground/40 flex-shrink-0 transition-transform duration-200"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop to close dropdown */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown content */}
          <div
            className="absolute top-full left-0 right-0 mt-1 z-20 bg-card rounded-md overflow-hidden"
            style={{
              boxShadow: '0 4px 16px hsl(var(--foreground) / 0.08)',
            }}
          >
            {/* Board list */}
            <div className="max-h-64 overflow-y-auto">
              {boards.map(board => {
                const isActive = board.id === activeBoardId
                const isShared = board.members && board.members.length > 0
                const isEditing = editingBoardId === board.id
                const canEdit = isOwner(board.id)

                if (isEditing) {
                  return (
                    <div key={board.id} className="p-3">
                      <input
                        type="text"
                        value={editingBoardName}
                        onChange={(e) => setEditingBoardName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit(board.id)
                          if (e.key === 'Escape') handleCancelEdit()
                        }}
                        autoFocus
                        className="w-full px-3 py-2 text-sm font-serif bg-card rounded-md text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow mb-2"
                        style={{
                          boxShadow: '0 1px 3px hsl(var(--foreground) / 0.04)',
                        }}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveEdit(board.id)}
                          className="flex-1 px-3 py-1.5 text-xs font-sans font-medium rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity active:scale-[0.98]"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="flex-1 px-3 py-1.5 text-xs font-sans font-medium rounded-md bg-transparent text-foreground/70 hover:bg-secondary transition-colors"
                          style={{
                            boxShadow: '0 1px 3px hsl(var(--foreground) / 0.04)',
                          }}
                        >
                          Cancel
                        </button>
                        {confirmDelete === board.id ? (
                          <button
                            onClick={() => handleDelete(board.id)}
                            className="px-3 py-1.5 text-xs font-sans font-medium rounded-md bg-destructive text-white hover:opacity-90 transition-opacity active:scale-[0.98]"
                          >
                            Confirm
                          </button>
                        ) : (
                          <button
                            onClick={() => handleDelete(board.id)}
                            className="px-3 py-1.5 rounded-md bg-transparent text-destructive hover:bg-destructive/10 transition-colors active:scale-[0.98]"
                            title="Delete board"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  )
                }

                return (
                  <div
                    key={board.id}
                    className="w-full px-3 py-2 flex items-center justify-between text-left text-sm transition-colors duration-100 hover:bg-accent group cursor-pointer"
                    style={{
                      background: isActive ? 'hsl(var(--accent))' : 'transparent',
                    }}
                    onClick={() => handleSelectBoard(board.id)}
                  >
                    <span className={`truncate font-serif ${isActive ? 'font-bold' : 'font-normal'}`}>{board.name}</span>
                    <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                      {isShared && (
                        <Users size={12} className="text-muted-foreground/50" />
                      )}
                      {canEdit && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleStartEdit(board, e)
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:text-foreground text-muted-foreground/50"
                          title="Rename board"
                        >
                          <Pencil size={11} />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Divider */}
            <div className="h-px bg-border/15" />

            {/* Create new board section */}
            {isCreating ? (
              <form onSubmit={handleCreateBoard} className="p-3">
                <input
                  type="text"
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  placeholder="Board name"
                  autoFocus
                  className="w-full px-3 py-2 text-sm font-serif bg-card rounded-md text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
                  style={{
                    boxShadow: '0 1px 3px hsl(var(--foreground) / 0.04)',
                  }}
                  onBlur={(e) => {
                    // Don't close if clicking the create button
                    if (!e.relatedTarget?.dataset?.createButton) {
                      setIsCreating(false)
                      setNewBoardName('')
                    }
                  }}
                />
                <div className="flex gap-2 mt-3">
                  <button
                    type="submit"
                    data-create-button="true"
                    className="flex-1 px-3 py-2 text-xs font-sans font-medium rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity active:scale-[0.98]"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreating(false)
                      setNewBoardName('')
                    }}
                    className="flex-1 px-3 py-2 text-xs font-sans font-medium rounded-md bg-transparent text-foreground/70 hover:bg-secondary transition-colors"
                    style={{
                      boxShadow: '0 1px 3px hsl(var(--foreground) / 0.04)',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setIsCreating(true)}
                className="w-full px-3 py-2 flex items-center gap-2 text-left text-sm transition-colors duration-100 hover:bg-accent"
              >
                <Plus size={14} className="text-foreground/70" />
                <span className="font-serif text-foreground/70">New Board</span>
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}

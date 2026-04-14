import { useState } from 'react'
import { ChevronDown, Plus, Users } from 'lucide-react'

export default function BoardSwitcher({
  boards,
  activeBoardId,
  onSelectBoard,
  onCreateBoard,
  isOwner
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newBoardName, setNewBoardName] = useState('')

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

  return (
    <div className="relative">
      {/* Active board button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-md bg-card border border-border/30 text-foreground text-sm font-medium font-sans transition-colors duration-100 hover:bg-secondary"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="truncate">{activeBoard?.name || 'Loading...'}</span>
          {activeBoard?.members && activeBoard.members.length > 0 && (
            <Users size={12} className="text-muted-foreground/50 flex-shrink-0" />
          )}
        </div>
        <ChevronDown
          size={14}
          className="text-muted-foreground/50 flex-shrink-0 transition-transform duration-200"
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
          <div className="absolute top-full left-0 right-0 mt-1 z-20 bg-card border border-border/50 rounded-md shadow-sm overflow-hidden">
            {/* Board list */}
            <div className="max-h-64 overflow-y-auto">
              {boards.map(board => {
                const isActive = board.id === activeBoardId
                const isShared = board.members && board.members.length > 0

                return (
                  <button
                    key={board.id}
                    onClick={() => handleSelectBoard(board.id)}
                    className="w-full px-3 py-2 flex items-center justify-between text-left text-sm font-sans transition-colors duration-100 hover:bg-accent"
                    style={{
                      background: isActive ? 'hsl(var(--accent))' : 'transparent',
                      fontWeight: isActive ? 500 : 400,
                    }}
                  >
                    <span className="truncate">{board.name}</span>
                    {isShared && (
                      <Users size={12} className="text-muted-foreground/50 flex-shrink-0 ml-2" />
                    )}
                  </button>
                )
              })}
            </div>

            {/* Divider */}
            <div className="h-px bg-border/15" />

            {/* Create new board section */}
            {isCreating ? (
              <form onSubmit={handleCreateBoard} className="p-2">
                <input
                  type="text"
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  placeholder="Board name"
                  autoFocus
                  className="w-full px-2 py-1.5 text-sm font-sans bg-card border border-border rounded text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
                  onBlur={(e) => {
                    // Don't close if clicking the create button
                    if (!e.relatedTarget?.dataset?.createButton) {
                      setIsCreating(false)
                      setNewBoardName('')
                    }
                  }}
                />
                <div className="flex gap-2 mt-2">
                  <button
                    type="submit"
                    data-create-button="true"
                    className="flex-1 px-2 py-1 text-xs font-sans font-medium rounded bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreating(false)
                      setNewBoardName('')
                    }}
                    className="flex-1 px-2 py-1 text-xs font-sans rounded bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setIsCreating(true)}
                className="w-full px-3 py-2 flex items-center gap-2 text-left text-sm font-sans text-foreground/70 transition-colors duration-100 hover:bg-accent hover:text-foreground"
              >
                <Plus size={14} />
                New Board
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}

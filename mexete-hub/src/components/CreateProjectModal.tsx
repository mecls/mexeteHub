import React, { useState } from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import EmojiPicker from 'emoji-picker-react';
import Image from 'next/image';

const CreateProjectModal = ({ onClose }: { onClose: () => void }) => {
  const [projectName, setProjectName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [emoji, setEmoji] = useState('')
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false)
  const [isHovering, setIsHovering] = useState(false)

  // Random emoji array for the "Pick icon" feature
  const randomEmojis = ['', '', '', '⭐', '', '', '', '⚡', '🌟', '🎪', '🎭', '🎪', '🎨', '🎯', '🎪', '🎭', '🎪', '🎨', '🎯', '🎪']

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!projectName.trim()) return
    
    setIsLoading(true)
    try {
      // TODO: Add your project creation logic here
      console.log('Creating project:', projectName, 'with emoji:', emoji)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Close modal and reset form
      setProjectName('')
      setEmoji('')
      onClose()
    } catch (error) {
      console.error('Error creating project:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleEmojiSelect = (emojiData: any) => {
    setEmoji(emojiData.emoji)
    setIsEmojiPickerOpen(false)
  }

  const handleClearEmoji = (e: React.MouseEvent) => {
    e.stopPropagation()
    setEmoji('')
  }

  const handlePickRandomEmoji = () => {
    const randomEmoji = randomEmojis[Math.floor(Math.random() * randomEmojis.length)]
    setEmoji(randomEmoji)
    setIsEmojiPickerOpen(true) // Keep picker open so user can change it
  }

  // Add click outside handler for emoji picker
  const handleModalClick = (e: React.MouseEvent) => {
    // If emoji picker is open and click is not on the emoji picker or emoji button
    if (isEmojiPickerOpen) {
      const target = e.target as Element
      const isEmojiPicker = target.closest('.emoji-picker-container')
      const isEmojiButton = target.closest('.emoji-button')
      
      if (!isEmojiPicker && !isEmojiButton) {
        setIsEmojiPickerOpen(false)
      }
    }
  }

  return (
    <div 
      className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50'
      onClick={handleBackdropClick}
    >
      <div className='bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 transform transition-all duration-200 ease-out'>
        {/* Content */}
        <form onSubmit={handleSubmit} className='p-24' onClick={handleModalClick}>
          <div className='space-y-4'>
            <div className='relative'>
              <div 
                className='flex items-center'
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                {/* Emoji display - now clickable */}
                {emoji && (
                  <button
                    type='button'
                    onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
                    className='text-3xl px-4 hover:bg-gray-100 rounded-md transition-colors cursor-pointer'
                    style={{ fontSize: '32px' }}
                    title='Click to change emoji'
                  >
                    {emoji}
                  </button>
                )}
                
                {/* Pick icon button - only visible on hover */}
                {isHovering && !emoji && (
                  <button
                    type='button'
                    onClick={handlePickRandomEmoji}
                    className='emoji-button absolute left-0 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-2 rounded-md hover:bg-gray-100 transition-colors'
                    title='Pick icon'
                  >
                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01' />
                    </svg>
                  </button>
                )}
                
                {/* Input with conditional padding */}
                <Input
                  id='project-name'
                  type='text'
                  placeholder='New Project'
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className='w-full border-none shadow-none focus:ring-0 focus:border-none bg-transparent placeholder:text-gray-300'
                  style={{
                    fontSize: '32px',
                    marginBottom: '16px',
                    fontWeight: 'bold',
                    color: '#000000',
                    border: 'none',
                    outline: 'none',
                    borderRadius: '0',
                    padding: '0',
                    paddingLeft: emoji ? '16px' : '0', // Add padding when emoji is present
                    boxShadow: 'none',
                    backgroundColor: 'transparent',
                    caretColor: '#000000',
                    caret: '3px'
                  }}
                  required
                  autoFocus
                  onFocus={(e) => {
                    e.target.style.borderBottomColor = '#000000'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderBottomColor = 'transparent'
                  }}
                />
              </div>
            </div>
            
            {/* Emoji picker section - only show if emoji is selected */}
            {emoji && (
              <div className='relative'>
                {/* Emoji Picker */}
                {isEmojiPickerOpen && (
                  <div className='emoji-picker-container fixed z-[60]' style={{ bottom: '30vh' }}>
                    <div className='bg-white border border-gray-200 rounded-lg shadow-sm p-2 ml-24'>
                      <EmojiPicker
                        onEmojiClick={handleEmojiSelect}
                        width={300}
                        height={400}
                        searchPlaceholder="Search emoji..."
                        previewConfig={{
                          showPreview: false,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className='flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200'>
            <button
              type='button'
              disabled={!projectName.trim() || isLoading}
              className='px-4 py-2 rounded-sm font-medium transition-colors w-full'
              style={{
                backgroundColor: '#000000',
                color: '#ffffff',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#1f2937' // gray-800 on hover
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#000000' // back to black
              }}
              onClick={handleSubmit}
            >
              {isLoading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateProjectModal
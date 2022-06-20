export function ProgressBar ({ progress = 0 }: { progress?: number }) {
  const width = (progress * 100) + '%'
  return (
    <div data-c-progress-bar>
      <div className='inner' style={{ width }} />
    </div>
  )
}

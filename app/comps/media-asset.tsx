import { Link } from '@remix-run/react'

export function MediaAsset (props: any) {
  const { record } = props
  if (!record) return null
  return (
    <div>
      <Link to={'/media/' + record.id}>
        <h2>{record.value.title || record.id}</h2>
      </Link>
      <video controls src={'/file/' + record.value.file} />
        <p>{record.value.description}</p>
      <p>
      {record.value.duration && (
        <span>Duration: {formatDuration(record.value.duration)}</span>
      )}
        <br />
        <Link to={'/metadata/' + record.id}>
          full metadata
        </Link>
        <br />
        <DateFormatter date={record.timestamp} />
      </p>
    </div>
  )
}

function formatDuration (seconds: number): string {
  const date = new Date(0)
  date.setSeconds(seconds)
  const timeString = date.toISOString().substr(11, 8)
  return timeString
}

function DateFormatter ({ date }: any) {
  if (!date) return null
  const formatted = new Intl.DateTimeFormat('de-DE', { dateStyle: 'full', timeStyle: 'long' }).format(new Date(date))
  return <em>{formatted}</em>
}

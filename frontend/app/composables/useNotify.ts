// A small global snackbar so any page can show success / error feedback.
interface Notice {
  show: boolean
  text: string
  color: string
  timeout: number
}

export function useNotify() {
  const notice = useState<Notice>('notice', () => ({ show: false, text: '', color: 'success', timeout: 3000 }))

  function notify(text: string, color = 'success', timeout = 3000) {
    notice.value = { show: true, text, color, timeout }
  }

  return {
    notice,
    notify,
    success: (t: string) => notify(t, 'success'),
    error: (t: string) => notify(t, 'error', 6000),
    info: (t: string) => notify(t, 'info'),
    warning: (t: string) => notify(t, 'warning', 4000),
  }
}

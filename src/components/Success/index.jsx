import style from './Success.module.scss'

export default function Success() {
  return (
    <div className={style.loadingOverlay}>
      <div className={style.checkmark}>
        <div className={style.checkmark_circle}></div>
        <div className={style.checkmark_stem}></div>
        <div className={style.checkmark_kick}></div>
      </div>
    </div>
  )
}

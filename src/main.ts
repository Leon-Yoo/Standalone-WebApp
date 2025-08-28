import './style.css'
import { ExcelKeywordAdmin } from './admin/ExcelKeywordAdmin'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <h1>Excel Keyword Admin</h1>
    <div id="admin-container"></div>
  </div>
`

const adminContainer = document.querySelector<HTMLDivElement>('#admin-container')!
const admin = new ExcelKeywordAdmin(adminContainer)

// 전역에서 접근 가능하도록 설정 (삭제 버튼용)
;(window as any).admin = admin

// 앱 초기화
admin.init().catch(console.error)

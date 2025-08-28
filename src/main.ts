import './style.css'
import { FashionDictionaryAdmin } from './admin/FashionDictionaryAdmin'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <h1>🔍 패션 검색 사전 관리</h1>
    <div id="admin-container"></div>
  </div>
`

const adminContainer = document.querySelector<HTMLDivElement>('#admin-container')!
const dictionaryAdmin = new FashionDictionaryAdmin(adminContainer)

// 전역에서 접근 가능하도록 설정 (삭제 버튼용)
;(window as any).dictionaryAdmin = dictionaryAdmin

// 앱 초기화
dictionaryAdmin.init().catch(console.error)

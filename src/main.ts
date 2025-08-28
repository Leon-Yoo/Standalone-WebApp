import './style.css'
import { GoogleSheetsKeywordAdmin } from './admin/KeywordAdmin'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <h1>Google Sheets Keyword Admin</h1>
    <div id="admin-container"></div>
  </div>
`

const adminContainer = document.querySelector<HTMLDivElement>('#admin-container')!
const admin = new GoogleSheetsKeywordAdmin(adminContainer)
admin.init()

import './style.css'
import { ElasticsearchKeywordAdmin } from './admin/KeywordAdmin'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <h1>Elasticsearch Keyword Admin</h1>
    <div id="admin-container"></div>
  </div>
`

const adminContainer = document.querySelector<HTMLDivElement>('#admin-container')!
const admin = new ElasticsearchKeywordAdmin(adminContainer)
admin.init()

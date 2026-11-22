/**
 * 喝三杯咖啡:Google 試算表(mycafe 分頁)⇄ 網站資料庫 商品雙向同步
 *
 * 安裝:試算表 → 擴充功能 → Apps Script → 左側「檔案」旁的 + → 指令碼 → 命名 mycafe-sync
 *       → 貼上本檔全部內容 → 儲存 → 選函式 mycafeSetup → 執行 → 授權 → 填網址與金鑰
 *
 * 規則(三方比對:目前表格 / 目前網站 / 上次同步的基準 _base):
 *   只有表格改過 → 寫到網站;只有網站改過 → 寫回表格;兩邊都改 → 標示衝突,不覆蓋。
 *   空白格子不會蓋掉網站內容;不同步刪除(要下架請把「狀態」改成 下架)。
 * 所有函式都以 mycafe / mc_ 開頭,不會和同一專案內其他腳本衝突。
 */
var MC_TAB = 'mycafe';
var MC_STATUS = '同步狀態';
var MC_BASE = '_base';
var MC_BATCH = 20;

function mycafeSetup() {
  var ui = SpreadsheetApp.getUi();
  var props = PropertiesService.getScriptProperties();
  var u = ui.prompt('網站網址', '例如 https://mycafe.de5.net', ui.ButtonSet.OK_CANCEL);
  if (u.getSelectedButton() !== ui.Button.OK) return;
  var t = ui.prompt('同步金鑰 SYNC_TOKEN', '貼上安裝腳本印出的金鑰', ui.ButtonSet.OK_CANCEL);
  if (t.getSelectedButton() !== ui.Button.OK) return;
  props.setProperty('MC_SITE_URL', u.getResponseText().trim().replace(/\/+$/, ''));
  props.setProperty('MC_SYNC_TOKEN', t.getResponseText().trim());
  mc_installTriggers_();
  mycafeSync();
  ui.alert('完成', '已啟用每分鐘自動同步。重新整理試算表後,選單會出現「喝三杯咖啡」。', ui.ButtonSet.OK);
}

function mycafeMenu() {
  SpreadsheetApp.getUi()
    .createMenu('喝三杯咖啡')
    .addItem('立即同步', 'mycafeSync')
    .addItem('衝突:以表格為準(選取列)', 'mycafeForceSheet')
    .addItem('衝突:以網站為準(選取列)', 'mycafeForceSite')
    .addSeparator()
    .addItem('重新設定網址與金鑰', 'mycafeSetup')
    .addItem('停止自動同步', 'mycafeStop')
    .addToUi();
}

function mycafeStop() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'mycafeSync') ScriptApp.deleteTrigger(t);
  });
}

function mc_installTriggers_() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    var f = t.getHandlerFunction();
    if (f === 'mycafeSync' || f === 'mycafeMenu') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('mycafeSync').timeBased().everyMinutes(1).create();
  ScriptApp.newTrigger('mycafeMenu').forSpreadsheet(SpreadsheetApp.getActive()).onOpen().create();
}

function mycafeSync() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(20000)) return;
  try {
    mc_run_();
    var s = SpreadsheetApp.getActive().getSheetByName(MC_TAB);
    if (s) s.getRange('A1').clearNote();
  } catch (e) {
    var s2 = SpreadsheetApp.getActive().getSheetByName(MC_TAB);
    if (s2) s2.getRange('A1').setNote('最近一次同步失敗:' + e.message);
    console.error(e);
  } finally {
    lock.releaseLock();
  }
}

function mc_api_(path, method, payload) {
  var p = PropertiesService.getScriptProperties();
  var res = UrlFetchApp.fetch(p.getProperty('MC_SITE_URL') + path, {
    method: method,
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + p.getProperty('MC_SYNC_TOKEN') },
    payload: payload ? JSON.stringify(payload) : undefined,
    muteHttpExceptions: true
  });
  var code = res.getResponseCode();
  var text = res.getContentText();
  if (code < 200 || code >= 300) throw new Error('HTTP ' + code + ' ' + text.slice(0, 200));
  return JSON.parse(text);
}

function mc_canon_(headers, obj) {
  return headers.map(function (h) {
    var v = obj[h];
    if (v === null || v === undefined) v = '';
    if (h === '售價') {
      if (v === '') return '';
      var n = Number(v);
      return isNaN(n) ? String(v).trim() : String(n);
    }
    return String(v).replace(/\r\n?/g, '\n').trim();
  }).join('\u0001');
}

function mc_hash_(s) {
  var d = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, s, Utilities.Charset.UTF_8);
  return d.map(function (b) { return ('0' + (b < 0 ? b + 256 : b).toString(16)).slice(-2); }).join('');
}

function mc_toObj_(headerRow, arr) {
  var o = {};
  headerRow.forEach(function (h, i) { var k = String(h).trim(); if (k) o[k] = arr[i]; });
  return o;
}

function mc_pick_(headers, obj) {
  var o = {};
  headers.forEach(function (h) { o[h] = obj[h] === undefined || obj[h] === null ? '' : obj[h]; });
  return o;
}

function mc_ensureHeader_(sheet, headers) {
  var need = headers.concat([MC_STATUS, MC_BASE]);
  var width = Math.max(sheet.getLastColumn(), 1);
  var row = sheet.getRange(1, 1, 1, width).getValues()[0].map(function (v) { return String(v).trim(); });
  var cols = {};
  var next = 0;
  row.forEach(function (h, i) { if (h) { cols[h] = i + 1; next = i + 1; } });
  need.forEach(function (h) {
    if (!cols[h]) {
      next += 1;
      if (next > sheet.getMaxColumns()) sheet.insertColumnsAfter(sheet.getMaxColumns(), next - sheet.getMaxColumns());
      sheet.getRange(1, next).setValue(h);
      cols[h] = next;
    }
  });
  sheet.getRange(1, 1, 1, next).setFontWeight('bold');
  sheet.setFrozenRows(1);
  sheet.hideColumns(cols[MC_BASE]);
  return cols;
}

// 把 src(網站資料)寫進某一列;src 為 null 時只更新狀態
function mc_put_(sheet, rowNo, width, arr, headerRow, src, base, status) {
  var out = arr.slice();
  headerRow.forEach(function (h, i) {
    var k = String(h).trim();
    if (src && Object.prototype.hasOwnProperty.call(src, k)) out[i] = src[k] === null || src[k] === undefined ? '' : src[k];
    if (k === MC_STATUS) out[i] = status;
    if (k === MC_BASE && base !== null) out[i] = base;
  });
  sheet.getRange(rowNo, 1, 1, width).setValues([out]);
}

function mc_newRow_(headerRow, src, base, status) {
  return headerRow.map(function (h) {
    var k = String(h).trim();
    if (k === MC_STATUS) return status;
    if (k === MC_BASE) return base;
    return Object.prototype.hasOwnProperty.call(src, k) ? src[k] : '';
  });
}

function mc_run_() {
  var data = mc_api_('/api/sync/products', 'get');
  var headers = data.headers;
  var site = {};
  data.rows.forEach(function (r) { site[String(r.slug)] = r; });

  var ss = SpreadsheetApp.getActive();
  var sheet = ss.getSheetByName(MC_TAB) || ss.insertSheet(MC_TAB);
  mc_ensureHeader_(sheet, headers);
  var width = sheet.getLastColumn();
  var headerRow = sheet.getRange(1, 1, 1, width).getValues()[0];
  var last = sheet.getLastRow();
  var values = last >= 2 ? sheet.getRange(2, 1, last - 1, width).getValues() : [];
  var now = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'MM/dd HH:mm');

  var seen = {};
  var pushes = [];

  values.forEach(function (arr, i) {
    var rowNo = i + 2;
    var obj = mc_toObj_(headerRow, arr);
    var slug = String(obj.slug === undefined ? '' : obj.slug).trim();
    if (!slug) return;
    if (seen[slug]) {
      mc_put_(sheet, rowNo, width, arr, headerRow, null, null, '✗ ' + now + ' slug 重複');
      return;
    }
    seen[slug] = true;

    var cur = mc_hash_(mc_canon_(headers, obj));
    var base = String(obj[MC_BASE] || '');
    var status = String(obj[MC_STATUS] || '');
    var s = site[slug];
    var item = { rowNo: rowNo, arr: arr, obj: obj, slug: slug };

    if (!s) { pushes.push(item); return; }
    var web = mc_hash_(mc_canon_(headers, s));

    if (cur === web) {
      if (base !== web) mc_put_(sheet, rowNo, width, arr, headerRow, s, web, '✓ ' + now + ' 已同步');
    } else if (base && cur === base) {
      mc_put_(sheet, rowNo, width, arr, headerRow, s, web, '↓ ' + now + ' 網站更新');
    } else if (base && web === base) {
      pushes.push(item);
    } else if (base) {
      if (status.indexOf('⚠') !== 0) {
        mc_put_(sheet, rowNo, width, arr, headerRow, null, null,
          '⚠ ' + now + ' 衝突:兩邊都改過。選取此列,用選單「以表格為準」或「以網站為準」');
      }
    } else {
      pushes.push(item);
    }
  });

  for (var i = 0; i < pushes.length; i += MC_BATCH) {
    var chunk = pushes.slice(i, i + MC_BATCH);
    var res = mc_api_('/api/sync/products', 'post', {
      rows: chunk.map(function (p) { return mc_pick_(headers, p.obj); })
    });
    var bySlug = {};
    res.results.forEach(function (r) { bySlug[r.slug] = r; });
    chunk.forEach(function (p) {
      var r = bySlug[p.slug];
      if (r && r.ok && r.row) {
        var msg = '↑ ' + now + (r.action === 'created' ? ' 表格新增到網站' : ' 表格更新') + (r.warning ? ' ⚠ ' + r.warning : '');
        mc_put_(sheet, p.rowNo, width, p.arr, headerRow, r.row, mc_hash_(mc_canon_(headers, r.row)), msg);
      } else {
        mc_put_(sheet, p.rowNo, width, p.arr, headerRow, null, null,
          '✗ ' + now + ' ' + (r && r.error ? r.error : '未知錯誤'));
      }
    });
  }

  // 網站有、表格沒有的商品 → 新增列
  var add = [];
  Object.keys(site).forEach(function (slug) {
    if (!seen[slug]) add.push(mc_newRow_(headerRow, site[slug], mc_hash_(mc_canon_(headers, site[slug])), '↓ ' + now + ' 網站新增'));
  });
  if (add.length) sheet.getRange(sheet.getLastRow() + 1, 1, add.length, width).setValues(add);
}

function mc_selectedRows_() {
  var sheet = SpreadsheetApp.getActiveSheet();
  if (sheet.getName() !== MC_TAB) throw new Error('請在「' + MC_TAB + '」分頁選取要處理的列');
  var r = sheet.getActiveRange();
  var rows = [];
  for (var i = 0; i < r.getNumRows(); i++) { if (r.getRow() + i >= 2) rows.push(r.getRow() + i); }
  return { sheet: sheet, rows: rows };
}

// 以表格為準:清掉基準,下次同步會把這列推到網站
function mycafeForceSheet() {
  var sel = mc_selectedRows_();
  var headerRow = sel.sheet.getRange(1, 1, 1, sel.sheet.getLastColumn()).getValues()[0].map(String);
  var col = headerRow.indexOf(MC_BASE) + 1;
  if (col < 1) return;
  sel.rows.forEach(function (n) { sel.sheet.getRange(n, col).clearContent(); });
  mycafeSync();
}

// 以網站為準:把基準設成目前表格內容,下次同步會把網站的內容拉回這列
function mycafeForceSite() {
  var sel = mc_selectedRows_();
  var headers = mc_api_('/api/sync/products', 'get').headers;
  var width = sel.sheet.getLastColumn();
  var headerRow = sel.sheet.getRange(1, 1, 1, width).getValues()[0];
  var col = headerRow.map(String).indexOf(MC_BASE) + 1;
  if (col < 1) return;
  sel.rows.forEach(function (n) {
    var obj = mc_toObj_(headerRow, sel.sheet.getRange(n, 1, 1, width).getValues()[0]);
    sel.sheet.getRange(n, col).setValue(mc_hash_(mc_canon_(headers, obj)));
  });
  mycafeSync();
}

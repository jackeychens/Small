webpackJsonp([2,4],{361:function(e,n,t){t(864)(t(597))},597:function(e,n){e.exports="(function(){ \"use strict\";\n\n  function QSnippet() {\n    this.selectedRow = null;\n    this.copyButton = null;\n  }\n\n  QSnippet.prototype.parsePlistForElementsByName = function(name) {\n    var es = document.getElementsByName(name);\n    \n    for (var i = 0; i < es.length; i++) {\n      var e = es[i];\n      var table = e.children[0];\n      var rs = table.rows;\n      for (var j = 0; j < rs.length; j++) {\n        var r = rs[j];\n        r.addEventListener('click', (e) => {\n          var row = e.target;\n          if (row.nodeName == 'BUTTON') {\n            // row.click();\n          } else if (row.nodeName == 'SPAN' && row.className.indexOf('button') == 0) {\n            // click expand button\n            this.togglePlistNode(table, row);\n          } else {\n            // select row\n            while (row != null && row.nodeName != 'TR') {\n              row = row.parentNode;\n            }\n            if (row != null) {\n              if (row.dataset.level != null) {\n                this.selectRow(table, row);\n              } else {\n                if (this.selectedRow != null) {\n                  this.deselectRow(this.selectedRow);\n                }\n              }\n            }\n          }\n        });\n      }\n    }\n  };\n\n  QSnippet.prototype.initCopyButton = function() {\n    this.copyButton = document.getElementById('qsnippet-copy-button');\n    this.copyButton.addEventListener('click', (e) => {\n      if (this.selectedRow != null) {\n        this.copyRow(this.selectedRow);\n      }\n    });\n  }\n\n  QSnippet.prototype.selectRow = function(table, row) {\n    if (row.nodeName != 'TR') return;\n\n    var preselectedRow = this.selectedRow;\n    if (preselectedRow == row) return;\n\n    if (preselectedRow != null) {\n      this.deselectRow(preselectedRow);\n    }\n\n    row.className = row.className + ' selected';\n    this.selectedRow = row;\n\n    var depth = +row.dataset.level;\n\n    // Show copy button\n    var lastCol = row.cells[row.cells.length - 1];\n    if (this.copyButton == null) {\n        this.initCopyButton();\n    }\n    this.copyButton.dataset.hidden = false;//depth <= 0;\n    this.copyButton.parentNode.removeChild(this.copyButton);\n    lastCol.appendChild(this.copyButton);\n\n    // Apply style for children\n    row = row.nextElementSibling;\n    while (row != null) {\n      var d = row.dataset.level;\n      if (d == null || +d <= depth) {\n        break;\n      }\n      \n      // children node\n      row.className = row.className + ' inner-selected';\n      row = row.nextElementSibling;\n    }\n  };\n\n  QSnippet.prototype.deselectRow = function(row) {\n    row.className = row.className.replace(' selected', '');\n    var depth = +row.dataset.level;\n    row = row.nextElementSibling;\n    while (row != null) {\n      var d = row.dataset.level;\n      if (d == null || +d <= depth) {\n        break;\n      }\n      \n      // children node\n      row.className = row.className.replace(' inner-selected', '');\n      row = row.nextElementSibling;\n    }\n\n    this.copyButton.dataset.hidden = true;\n\n    delete this.selectedRow;\n  };\n\n  QSnippet.prototype.deselectAllRows = function() {\n    var selectedRow = this.selectedRow\n    if (selectedRow != null) {\n      deselectRow(selectedRow);\n    }\n  };\n\n  QSnippet.prototype.togglePlistNode = function(table, button) {\n    var expanded = button.className.indexOf('expand-button') > 0;\n    // Toggle button style\n    if (expanded) {\n      button.className = 'button collapse-button';\n    } else {\n      button.className = 'button expand-button';\n    }\n\n    // Toggle children node visibility\n    var selectedRow = this.selectedRow;\n    var row = button.parentNode.parentNode;\n    var depth = +row.dataset.level;\n\n    row.dataset.expanded = expanded;\n    \n    if (expanded) {\n      this.expandRow(table, {row:row, display:true});\n    } else {\n      row = row.nextElementSibling;\n      while (row != null) {\n        if (row == selectedRow) {\n          this.deselectRow(row);\n        }\n\n        var d = row.dataset.level;\n        if (d == null || +d <= depth) {\n          break;\n        }\n        \n        // children node\n        row.dataset.hidden = true;\n        // row.style.display = 'none';\n        row = row.nextElementSibling;\n      }\n    }\n  };\n\n  QSnippet.prototype.expandRow = function(table, state) {\n    var depth = +state.row.dataset.level;\n    state.row = state.row.nextElementSibling;\n    while (state.row != null) {\n      if (+state.row.dataset.level < depth) {\n        state.display = state.row.dataset.expanded != \"false\";\n        break;\n      }\n\n      if (state.display) delete state.row.dataset.hidden;\n\n      state.display = state.display && state.row.dataset.expanded != \"false\";\n      this.expandRow(table, state);\n    }\n\n    return state;\n  };\n\n  QSnippet.prototype.copyRow = function(row) {\n    var s = '<?xml version=\"1.0\" encoding=\"UTF-8\"?>' +\n      '\\n<!DOCTYPE plist PUBLIC \"-//Apple//DTD PLIST 1.0//EN\" \"http://www.apple.com/DTDs/PropertyList-1.0.dtd\">' +\n      '\\n<plist version=\"1.0\">';\n    \n    // The Xcode Editor copy action bypass the first `key'.\n    // But it would resolve the correcty `key' on paste action.\n    // It seems the Xcode record the `key' by itself and not to the clipboard.\n    // Sadly, this cause the key-missing with our solution.\n    // FIXME: Carry the `key' to Xcode.\n    s += this.plistContentForRow({row: row, ignoresKey: true, depth: -1});\n    s += '\\n</plist>'\n    // console.log(s);\n    this.copy(s);\n  };\n\n  QSnippet.prototype.plistContentForRow = function(state) {\n    var s = '';\n    var depth = +state.row.dataset.level;\n    var info = this.parseRow(state.row);\n    var ignoresKey = state.ignoresKey;\n    if (!ignoresKey) {\n      s += '<key>' + info.key + '</key>';\n    }\n    if (info.type == 'dictionary') {\n      if (info.empty) {\n        s += '<dict/>';\n      } else {\n        s += '<dict>';\n        state.ignoresKey = false;\n        state.row = state.row.nextElementSibling;\n        state.depth = depth + 1;\n        s += this.plistContentForRow(state);\n        s += '</dict>';\n        state.ignoresKey = ignoresKey;\n        state.depth--;\n      }\n    } else if (info.type == 'array') {\n      if (info.empty) {\n        s += '<array/>';\n      } else {\n        s += '<array>';\n        state.ignoresKey = true;\n        state.row = state.row.nextElementSibling;\n        state.depth = depth + 1;\n        s += this.plistContentForRow(state);\n        s += '</array>';\n        state.ignoresKey = false;\n        state.depth--;\n      }\n    } else {\n      if (info.inter_value != null) {\n        s += info.inter_value;\n      } else {\n        s += '<' + info.type + '>' + info.value + '</' + info.type + '>';\n      }\n    }\n\n    var row = state.row.nextElementSibling;\n    if (row == null) return s;\n\n    if (+row.dataset.level == state.depth) {\n      state.row = row;\n      s += this.plistContentForRow(state);\n    }\n    return s;\n  }\n\n  QSnippet.prototype.parseRow = function(row) {\n    var type = row.dataset.type;\n    if (type == null) {\n      type = row.cells[1].children[0].innerText.toLowerCase();\n    }\n    // console.log(row);\n    return {\n      key: row.cells[0].children[1].innerText,\n      type: type,\n      value: row.cells[2].children[0].innerText,\n      inter_value: row.dataset.value,\n      empty: !!row.dataset.empty\n    }\n  }\n\n  QSnippet.prototype.copy = function(text) {\n    var id = \"qsnippet-copy-textarea\";\n    var existsTextarea = document.getElementById(id);\n    if(!existsTextarea){\n      var textarea = document.createElement(\"textarea\");\n      textarea.id = id;\n      // Place in top-left corner of screen regardless of scroll position.\n      textarea.style.position = 'fixed';\n      textarea.style.top = 0;\n      textarea.style.left = 0;\n\n      // Ensure it has a small width and height. Setting to 1px / 1em\n      // doesn't work as this gives a negative w/h on some browsers.\n      textarea.style.width = '1px';\n      textarea.style.height = '1px';\n\n      // We don't need padding, reducing the size if it does flash render.\n      textarea.style.padding = 0;\n\n      // Clean up any borders.\n      textarea.style.border = 'none';\n      textarea.style.outline = 'none';\n      textarea.style.boxShadow = 'none';\n\n      // Avoid flash of white box if rendered for any reason.\n      textarea.style.background = 'transparent';\n      document.querySelector(\"body\").appendChild(textarea);\n      existsTextarea = document.getElementById(id);\n    }\n\n    existsTextarea.value = text;\n    existsTextarea.select();\n    try {\n      var status = document.execCommand('copy');\n      if(!status){\n        console.error(\"Cannot copy text\");\n      }else{\n        this.copyButton.innerText = 'COPIED!';\n        this.copyButton.disabled = true;\n        setTimeout(() => {\n          this.copyButton.innerText = 'COPY';\n          this.copyButton.disabled = false;\n        }, 500);\n      }\n    } catch (err) {\n      console.log('Unable to copy.');\n    }\n  }\n\n  window.qSnippet = new QSnippet();\n})();"},864:function(e,n){e.exports=function(e){"undefined"!=typeof execScript?execScript(e):eval.call(null,e)}},867:function(e,n,t){e.exports=t(361)}},[867]);
//# sourceMappingURL=scripts.0610f9635b39db42dd88.bundle.map
// ==UserScript==
// @name        Edit Link Target
// @namespace        http://tampermonkey.net/
// @version        1.0
// @description        最新版参照のリンクカード➔ツール一覧表➔ツール纏めページ のリンクチェック・編集
// @author        Ameba Blog User
// @match        https://ameblo.jp/*
// @match        https://blog.ameba.jp/ucs/entry/srventryupdateinput.do?id=12762321136*
// @match        https://blog.ameba.jp/ucs/entry/srventryupdateinput.do?id=12742312677*
// @match        https://blog.ameba.jp/ucs/entry/srventryupdateinput.do?id=12722637005*
// @match        https://blog.ameba.jp/ucs/entry/srventryupdateinput.do?id=12742352151*
// @match        https://blog.ameba.jp/ucs/entry/srventryupdateinput.do?id=12724427128*
// @match        https://blog.ameba.jp/ucs/entry/srventryupdateinput.do?id=12742312732*
// @match        https://blog.ameba.jp/ucs/entry/srventryupdateinput.do?id=12724430769*
// @match        https://blog.ameba.jp/ucs/entry/srventryupdateinput.do?id=12742312787*
// @match        https://blog.ameba.jp/ucs/entry/srventryupdateinput.do?id=12742386229*
// @match        https://blog.ameba.jp/ucs/entry/srventryupdateinput.do?id=12828652236*
// @icon        https://www.google.com/s2/favicons?sz=64&domain=ameblo.jp
// @noframes
// @grant        none
// @updateURL        https://github.com/personwritep/Edit_Link_Target/raw/main/Edit_Link_Target.user.js
// @downloadURL        https://github.com/personwritep/Edit_Link_Target/raw/main/Edit_Link_Target.user.js
// ==/UserScript==



document.onclick=function(event){
    let elem=document.elementFromPoint(event.clientX, event.clientY);

    if(elem && event.shiftKey){ // 最新版参照のリンクカードを「Shift+左Clcik」で開始
        let select_link=elem.closest('.ogpCard_link');
        if(select_link){
            let link_url=select_link.getAttribute('href');
            let link_page_id= // リンク一覧ページID
                link_url.substring(link_url.indexOf('/entry-') +7, link_url.indexOf('.html'));
            if(link_page_id=='12762321136' || link_page_id=='12828652236'){
                event.preventDefault();
                event.stopImmediatePropagation();

                let tool_name=link_url.substring(link_url.indexOf('=') + 1); // ツール名
                let entry=document.querySelector('.js-entryWrapper');
                let test_id; // テストを開始した記事のID
                if(entry){
                    test_id=entry.getAttribute('data-unique-entry-id'); }

                if(tool_name.length!=0){
                    edit_link(tool_name, test_id); }

                function edit_link(tool_name, test_id){
                    let path=
                        'https://blog.ameba.jp/ucs/entry/srventryupdateinput.do?'+
                        'id='+ link_page_id +'&identity=ELT'+
                        '&name='+ tool_name +'&test_id='+ test_id;
                    window.open(path);
                } // edit_link()

            }}}

} // onclick



if(location.hostname=='blog.ameba.jp'){ // 管理・編集画面が条件

    let query=window.location.search.substring(1).split('&');
    let edit_page;
    let identity;
    let tool_name;
    let test_id;
    if(query.length==4){
        edit_page=query[0].split('=')[1]; // 編集で開いているリンクページのID
        identity=query[1].split('=')[1]; // 編集画面を開いたツールの照合
        tool_name=decodeURIComponent(query[2]).split('=')[1]; // 検査対象のツール名
        test_id=query[3].split('=')[1]; } // テストを開始した記事のID


    if(identity=='ELT'){ //「Edit Link Target」で編集画面を開いた場合のみ動作する

        let retry=0;
        let interval=setInterval(wait_target, 100);
        function wait_target(){
            retry++;
            if(retry>10){ // リトライ制限 10回 1sec
                clearInterval(interval); }
            let target=document.getElementById('cke_1_contents'); // 監視 target
            if(target){
                clearInterval(interval);
                main(); }}


        function main(){
            let editor_iframe=document.querySelector('.cke_wysiwyg_frame');
            if(editor_iframe){
                let iframe_doc=editor_iframe.contentWindow.document;
                if(iframe_doc){

                    if(edit_page=='12762321136' || edit_page=='12828652236'){
                        // 最新版一覧ページの編集画面の場合 🟦

                        let tool_link=iframe_doc.querySelectorAll('td:nth-child(2) a');
                        for(let k=0; k<tool_link.length; k++){
                            if(tool_link[k].textContent==tool_name){

                                tool_link[k].scrollIntoView({block: "center"});
                                if_mark(k); // ターゲット行に赤のアウトラインを表示

                                setTimeout(()=>{ // アップデートチェック
                                    update_check(k);
                                }, 400);

                                setTimeout(()=>{ // 纏めページを開く
                                    details_page(k);
                                }, 800);
                            }}


                        function if_mark(k){
                            let editor_iframe=document.querySelector('.cke_wysiwyg_frame');
                            if(editor_iframe){
                                let iframe_doc=editor_iframe.contentWindow.document;
                                if(iframe_doc){
                                    let tool_link=iframe_doc.querySelectorAll('td:nth-child(2) a');
                                    let tool_link_tr=tool_link[k].closest('tr');

                                    let tr_k;
                                    let all_tr=iframe_doc.querySelectorAll('tr');
                                    for(let k=0; k<all_tr.length; k++){
                                        if(all_tr[k]==tool_link_tr){
                                            tr_k=k; }}

                                    let style='<style class="tr_mark">'+
                                        'tr:nth-child('+ tr_k +'){ outline: 2px solid red; }</style>';
                                    if(!iframe_doc.querySelector('.tr_mark')){
                                        iframe_doc.documentElement.insertAdjacentHTML('beforeend', style); }}}}



                        function update_check(k){
                            let tool_id=tool_link[k].getAttribute('href').replace(/[^0-9]/g, '');

                            if(tool_id==test_id){
                                alert(
                                    "\n〔 "+ tool_name +" 〕　\n\n"+
                                    "この表のリンクは テスト開始ページと一致します");

                                set_version(tool_link[k]); }

                            else{
                                let conf_str=
                                    "\n〔 "+ tool_name +" 〕　\n\n"+
                                    "🔴 この表のリンクはテスト開始ページと一致しません\n\n"+
                                    "[OK] ▶ テスト開始ページへのリンクに書き換える\n"+
                                    "[キャンセル] ▶ リンクを書き換えない";
                                let ok=confirm(conf_str);
                                if(ok){
                                    let new_link='https://ameblo.jp/personwritep/entry-'+ test_id +'.html';
                                    tool_link[k].setAttribute('data-cke-saved-href', new_link);
                                    tool_link[k].setAttribute('href', new_link); }

                                set_version(tool_link[k]); }

                        } // update_check()



                        function details_page(k){
                            let tool_link_tr=tool_link[k].closest('tr');
                            let tool_link_sub=tool_link_tr.querySelector('td:nth-child(4) a');
                            if(tool_link_sub){
                                let sub_url=tool_link_sub.getAttribute('href');
                                if(sub_url){
                                    let sub_id=
                                        sub_url.substring(sub_url.indexOf('/entry-') +7, sub_url.indexOf('.html'));
                                    let sub_path=
                                        'https://blog.ameba.jp/ucs/entry/srventryupdateinput.do?'+
                                        'id='+ sub_id +'&identity=ELT'+
                                        '&name='+ tool_name +'&test_id='+ test_id;
                                    window.open(sub_path); }}

                        } // details_page()



                        function set_version(td_a){
                            let tool_ver_td=td_a.closest('td').nextElementSibling;

                            let panel=
                                '<div id="ver_in">'+
                                'Ver No: <input class="ver_in1" type="number" min="0.1" step="0.1">'+
                                '<input class="ver_in2" type="submit" value="Reset">'+
                                '<input class="ver_in3" type="submit" value="✖">'+
                                '<style>'+
                                '#ver_in { position: fixed; top: 30vh; left: 20px; z-index: 100; '+
                                'padding: 20px; border: 1px solid #aaa; background: #fff; '+
                                'font: normal 16px/22px Meiryo; } '+
                                '.ver_in1 { width: 68px; padding: 2px 2px 0 0; text-align: center; } '+
                                'input[type=number].ver_in1::-webkit-inner-spin-button { '+
                                'height: 20px; margin-top: 2px; } '+
                                '.ver_in2 { padding: 2px 6px 0; margin: 0 20px; } '+
                                '.ver_in3 { padding: 2px 6px 0;} '+
                                '</style></div>';

                            if(!document.querySelector('#ver_in')){
                                document.body.insertAdjacentHTML('beforeend', panel); }


                            let ver_in1=document.querySelector('.ver_in1');
                            let tool_ver=tool_ver_td.textContent;
                            if(tool_ver && ver_in1){
                                ver_in1.value=(tool_ver/1).toFixed(1);
                                ver_in1.onchange=function(){
                                    td_a.removeAttribute('style'); // 赤マークを消す
                                    let new_ver=(ver_in1.value/1).toFixed(1);
                                    ver_in1.value=new_ver;
                                    tool_ver_td.textContent=new_ver; }}


                            let ver_in2=document.querySelector('.ver_in2');
                            if(ver_in2 && ver_in1){
                                ver_in2.onclick=function(){
                                    ver_in1.value=tool_ver;
                                    tool_ver_td.textContent=(ver_in1.value/1).toFixed(1);
                                    td_a.removeAttribute('style'); }} // 赤マークを消す


                            let ver_in3=document.querySelector('.ver_in3');
                            if(ver_in3){
                                ver_in3.onclick=function(){
                                    td_a.removeAttribute('style'); // 赤マークを消す
                                    if(document.querySelector('#ver_in')){
                                        document.querySelector('#ver_in').remove(); }}}

                        } // set_version()

                    } // 最新版一覧ページの編集画面の場合



                    else { // ツール纏めページの編集画面の場合 🟦
                        let card_title=iframe_doc.querySelectorAll('.ogpCard_title');
                        let count=0;
                        for(let k=0; k<card_title.length; k++){
                            if(card_title[k].textContent.includes(tool_name)){
                                count+=1; }}
                        if(count>1){
                            alert("🔴 調査対象のツール名を含むカードが複数あります 🔴"); }
                        else if(count==0){
                            alert("🔴 調査対象のツール名を含むカードがありません 🔴"); }


                        let card_link=iframe_doc.querySelectorAll('.ogpCard_link');
                        for(let k=0; k<card_link.length; k++){
                            let title=card_link[k].querySelector('.ogpCard_title');
                            if(title){
                                let title_name=title.textContent;
                                if(title_name.includes(tool_name)){
                                    card_link[k].scrollIntoView({block: "center"});

                                    setTimeout(()=>{
                                        update_card(card_link[k], title_name);
                                    }, 400);
                                    break;
                                }}}



                        function update_card(card, title_name){
                            let tool_id=card.getAttribute('href').replace(/[^0-9]/g, '');
                            if(tool_id==test_id){
                                alert(
                                    "\n"+ title_name +"\n\n"+
                                    "リンクカードは テスト開始ページと一致します");

                                set_version_card(card); }

                            else{
                                let conf_str=
                                    "\n"+ title_name +"\n\n"+
                                    "🔴 リンクカードは テスト開始ページと一致しません\n\n"+
                                    "[OK] ▶ テスト開始ページへのリンクに書き換える\n"+
                                    "[キャンセル] ▶ リンクを書き換えない";
                                let ok=confirm(conf_str);
                                if(ok){
                                    let new_link='https://ameblo.jp/personwritep/entry-'+ test_id +'.html';
                                    card.setAttribute('data-cke-saved-href', new_link);
                                    card.setAttribute('href', new_link); }

                                set_version_card(card); }}



                        function set_version_card(card){
                            let title=card.querySelector('.ogpCard_title');
                            if(title){

                                let panel=
                                    '<div id="ver_in">'+
                                    'Ver No: <input class="ver_in1" type="number" min="0.1" step="0.1">'+
                                    '<input class="ver_in2" type="submit" value="Reset">'+
                                    '<input class="ver_in3" type="submit" value="✖">'+
                                    '<style>'+
                                    '#ver_in { position: fixed; top: 30vh; left: 20px; z-index: 100; '+
                                    'padding: 20px; border: 1px solid #aaa; background: #fff; '+
                                    'font: normal 16px/22px Meiryo; } '+
                                    '.ver_in1 { width: 68px; padding: 2px 2px 0 0; text-align: center; } '+
                                    'input[type=number].ver_in1::-webkit-inner-spin-button { '+
                                    'height: 20px; margin-top: 2px; } '+
                                    '.ver_in2 { padding: 2px 6px 0; margin: 0 20px; } '+
                                    '.ver_in3 { padding: 2px 6px 0;} '+
                                    '</style></div>';

                                if(!document.querySelector('#ver_in')){
                                    document.body.insertAdjacentHTML('beforeend', panel); }


                                let ver_in1=document.querySelector('.ver_in1');
                                let title_inner=title.innerHTML;
                                if(title_inner && ver_in1){
                                    let ver_reg=/\d+\.\d/;
                                    let ver_text=title_inner.match(ver_reg);
                                    ver_in1.value=(ver_text/1).toFixed(1);
                                    ver_in1.onchange=function(){
                                        let new_ver=(ver_in1.value/1).toFixed(1);
                                        ver_in1.value=new_ver;
                                        title.innerHTML=title_inner.replace(ver_reg, new_ver); }}


                                let ver_in2=document.querySelector('.ver_in2');
                                if(ver_in2 && ver_in1){
                                    ver_in2.onclick=function(){
                                        title.innerHTML=title_inner;
                                        let ver_reg=/[0-9]\.[0-9]/;
                                        let ver_text=title_inner.match(ver_reg);
                                        ver_in1.value=ver_text; }}


                                let ver_in3=document.querySelector('.ver_in3');
                                if(ver_in3){
                                    ver_in3.onclick=function(){
                                        if(document.querySelector('#ver_in')){
                                            document.querySelector('#ver_in').remove(); }}}

                            }} // set_version_card()

                    } // ツール纏めページの編集画面の場合 🟦

                }}} // main()

    } // if(identity=='ELT')

} // 管理・編集画面が条件

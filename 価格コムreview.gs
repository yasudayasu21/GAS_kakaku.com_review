function getreview() {
 
  //現在のスプレッドシートを取得
  var aBook = SpreadsheetApp.getActiveSpreadsheet();
  
  //"価格表"シートを取得
  var aSheet = aBook.getActiveSheet();
  
  //"価格表"シートの最終行を取得
  var lastColumn = aSheet.getDataRange().getLastColumn();
   
  //1列目の4行のURLを取得
  var url = aSheet.getRange(1, 4).getValue();
    
  //URLページを取得
  var response = UrlFetchApp.fetch(url);
    
  //HTML文を取得
  var html = response.getContentText('shift_jis');
    
  //h2タグから商品名を取得
  var itemName = getContentOfTagName(html, 'h2');
  
  //商品名をセルに書き込む
  aSheet.getRange(3, 2).setValue(itemName[0]);
  
    //シート名を商品名にする
  aSheet.setName(itemName);
  
  //シート名を商品名にする
  aSheet.setName(itemName);
    
  //mkrnameからメーカー名を取得
  var re1 = /mkrname: '([\s\S]*?)\'/;
  var mkrName = html.match(re1)[1];
    
  //メーカーをセルに書き込む
  aSheet.getRange(2, 2).setValue(mkrName);
  
  //どこから書き込むか決めるため”評価項目”と”タイトル”の行数を取得
  var Range1 = aSheet.getRange(1,1,50,1);
  var Arr1 = Range1.getValues();
  //getValuesは2次元配列になってしまうためindexOfで検索できるよう1次元配列に変換
  var Array1 = Arr1.map(function(array) { return array[0] });
  //評価項目の行数を取得
  var s0 =2+ Array1.indexOf("評価項目");
  var s1 =2+ Array1.indexOf("タイトル");
  var NOitems = s1-s0-1;
  Logger.log(Array1);
  Logger.log(NOitems);

var x =0;
  
for (var k=0; k<100; k++){ 
  //処理を1秒待つ
  Utilities.sleep(1000);
  //2回目以降はhtmlを修得しなおす  
  if (k>0){
  var url1 = url+'/Page='+(k+1)+'/';
  Logger.log(url1);
  //URLページを取得
  var response = UrlFetchApp.fetch(url1);
  //HTML文を取得
  html = response.getContentText('shift_jis');
  }
    
  //評価を取得する
  var temp = html.match(/<td class="rate(.*?)">/g);
  
  //評価を書き込む
  for (j=0; j<15; j++){
     for (i=0; i<NOitems; i++){
       try{
         var temp2=temp[i+NOitems*j].replace(/<td class="rate/,'');
         var hyouka=temp2.replace(/">/,'')
         }
       catch(e){
         break;
       }
         aSheet.getRange(s0+i,j+2+15*k).setValue(hyouka);
         }
  }
  //ここからはレビューを取り出す
  //まずはタイトル
  var title=Parser.data(html).from('<div class="reviewTitle">').to('</div>').iterate();
  //次はレビュー
  var review=Parser.data(html).from('<p class="revEntryCont">').to('</p>').iterate();
  
  //ページ内のレビュー数を取得
  var titlelength=title.length;
  Logger.log(titlelength);
  
  //書き込んでいく
  for (var i=0; i<titlelength; i++){
    var spreview = review[i].split('。');
    //レビューの行数を取得
    var reviewlength =spreview.length;
    
    for (var j = 0; j< reviewlength; j++){
      aSheet.getRange(s1+x+j,2).setValue(spreview[j].replace(/<("[^"]*"|'[^']*'|[^'">])*>/g,''));
    }
    aSheet.getRange(s1+x,1).setValue(title[i].replace(/<("[^"]*"|'[^']*'|[^'">])*>/g,''));
    x=x+reviewlength;
  }
  if(titlelength<15){
   break; 
  }
}
}



function getContentOfTagName(html, tagName) {
  
  var i = 0;
  var j = 0;
  var startOfTag;
  var endOfTag;
  var str = [ ];
  
  while(html.indexOf('<' + tagName,j)!=-1){
    
    //"<タグ名"の開始位置を取得
    j = html.indexOf('<' + tagName,j);
    
    //次の">"位置 + 1を文字列の始めとする
    startOfStr = html.indexOf('>',j)+1;
    
    //次の"</タグ名>"位置を文字列の終わりとする
    endOfStr = html.indexOf('</' + tagName + '>',j);
    
    //タグの間の文字列を配列に追加
    str[i] = html.substring(startOfStr, endOfStr);
    
    j = endOfStr + 1;
    i++;
  }  
  return str;
}



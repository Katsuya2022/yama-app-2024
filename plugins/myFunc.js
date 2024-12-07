export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.provide("myFunc", {
    sampleFunc,
  })
});

/**
 * サンプルメソッド
 * plugins/myFunc.jsに記載したプロジェクト全体で共通で使えるメソッドです\
 * 各ファイルから呼び出す際は以下コードを記述してください。\
 * const { $myFunc } = useNuxtApp(); ← 読み込み\
 * $myFunc.sampleFunc(a); ← 実行\
 * @param {*} msg コンソールログに表示するメッセージの引数です。
 */
function sampleFunc(msg) {
  console.log(`これはpluginsに作成した共通メソッドmySampleFuncです\n引数はこちら→${msg}`)
}
<template>
  <v-container>
    <h1>保有証券一覧</h1>
      <v-sheet class="pa-2" :elevation="2" rounded>
        <v-row v-if="dataType==1" align="center">
          <v-col cols="12" md="3">
            <v-radio-group v-model="dataType" hide-details="auto" inline>
              <v-radio label="CSVファイル" value="1"></v-radio>
              <v-radio label="過去データ" value="2"></v-radio>
            </v-radio-group>
          </v-col>
          <v-col cols="12" md="3">
            <v-file-input
              v-model="uploadFile"
              label="ファイルアップロード"
              density="compact"
              variant="outlined"
              accept=".csv"
              hide-details="auto"
            ></v-file-input>
          </v-col>
          <v-col cols="12" md="2">
            <!-- ファイルが選択されていない、または、保存チェックボックスがtrueでCSVデータ日付が未入力の場合はボタン非活性 -->
            <v-btn color="primary" block :disabled="!uploadFile||(saveFlag&&!csvDate)" @click="showCsvData">表示する</v-btn>
          </v-col>
          <v-col cols="6" md="2">
            <v-checkbox v-model="saveFlag" value="1" label="今回のデータを保存する"  hide-details="auto" density="compact"/>
          </v-col>
          <v-col cols="6" md="2">
            <v-text-field
              type="date"
              label="CSVデータ日付"
              density="compact"
              variant="outlined"
              hide-details="auto"
              :disabled="!saveFlag"
              v-model="csvDate"
              clearable
            />
          </v-col>
        </v-row>
        <v-row v-if="dataType==2" align="center">
          <v-col cols="12" md="3">
            <v-radio-group v-model="dataType"  hide-details="auto" inline>
              <v-radio label="CSVファイル" value="1"></v-radio>
              <v-radio label="過去データ" value="2"></v-radio>
            </v-radio-group>
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              label="yyyy/mm/dd"
              density="compact"
              :items="pastDateList"
              variant="outlined"
              hide-details="auto"
              v-model="selectedDate"
            ></v-select>
          </v-col>
          <v-col cols="12" md="3">
            <v-btn color="primary" block @click="showPastData">表示する</v-btn>
          </v-col>
        </v-row>
      </v-sheet>
      <v-sheet class="mt-4 pa-2" :elevation="2" rounded width="100%">
        <v-data-table
          :items-per-page="10"
          :headers="headers"
          :items="datas"
          height="55vh"
          fixed-header
          density="compact"
          items-per-page-text="表示行数"
        >
        <template v-slot:item="{ item }">
          <tr>
            <td>{{item.stockCode}}</td>
            <td>{{item.stockName}}</td>
            <td>{{item.quantity}}</td>
            <td>{{item.acquisitionPrice}}</td>
            <td>{{item.currentPrice}}</td>
            <td>{{item.acquisitionAmount}}</td>
            <td>{{item.valuation}}</td>
            <td :class="setTextColor(item.profitLoss)">{{ item.profitLoss }}</td>
          </tr>
      </template>
        </v-data-table>
      </v-sheet>
  </v-container>
</template>

<script setup>
import Encoding from "encoding-japanese";
import Papa from "papaparse";
import { ref, onMounted } from "vue";
import { collection, getDocs, addDoc } from "firebase/firestore";
const COLLECTION_NAME = "securitiesHoldings";
const SUB_COLLECTION_NAME = "securities";
const { $db } = useNuxtApp();

const pastDateList = ref([]);
onMounted(() => {
  getPastDateList();
})

const groupedData = ref({});  //日毎にグループ化した登録データ
/**
 * 全過去データを取得する\
 * 取得したデータをcsv日付(csvDate)毎にグループ化する
 */
const getPastDateList = async function() {
  try {
    // 画面表示時に登録データの日付を取得する
    const colRef = collection($db, COLLECTION_NAME);
    const docs = await getDocs(colRef);
    docs.forEach((doc) => {
      const data = doc.data();
      const csvDate = data["csvDate"];

      // グループ化データに同じ日付がなければグループを作成
      if (!groupedData.value[csvDate]) {
        groupedData.value[csvDate] = [];
      }
      // グループ毎にデータを格納する
      groupedData.value[csvDate].push(data);
    });
    pastDateList.value = Object.keys(groupedData.value);
  } catch(error) {
    console.error(error);
  }
}

/** 
 * アップロードしたcsvファイルの保有証券一覧をテーブルに表示する\
 * csvデータをUNICODEに変換してからデータを処理する
 */

const showCsvData = async function() {
  const csvFile = uploadFile.value;
  const reader = new FileReader();
  const unicodeString = await new Promise((resolve, reject) => {
    reader.onload = function(e) {
      const codes = new Uint8Array(e.target.result);
      const encoding = Encoding.detect(codes);
      let result = Encoding.convert(codes, {
        to: 'UNICODE',
        from: encoding,
        type: 'string',
      });
      resolve(result);
    };
    // CSVファイルの読み込み実行
    reader.readAsArrayBuffer(csvFile);
  })

  headers.value = headerColumns;
  datas.value = [];
  Papa.parse(unicodeString, {
    complete: (results) => {
      let stockDataRow = false;
      results.data.forEach((row, i) => {
        let data = {};
        // 個別株データ行直前の行の場合、次の行からが個別株データ行であることを示すフラグを立てる
        if (!stockDataRow && row[0] == "銘柄コード") {
          stockDataRow = true;
          return;
        // 個別株データ行以外かつ、個別株ヘッダ行以外の場合、次のループへスキップ
        } else if (!stockDataRow) {
          return;
        // 個別株データ行の次の行の場合、次の行からが個別株データ行であることを示すフラグをfalseにする
        } else if (stockDataRow && row[0] == "") {
          stockDataRow = false;
        // 個別株データ行の場合、テーブル表示用にデータを追加する
        } else if (stockDataRow) {
          data = {
            // userId: "u0001",
            // csvDate: csvDate.value.replaceAll("-", ""),
            stockCode: row[0],               // 銘柄コード
            stockName: row[1],               // 銘柄名称
            quantity: row[2],                // 保有株数
            // row[3]売却注文中
            acquisitionPrice: row[4],        // 取得単価
            currentPrice: row[5],            // 現在値
            acquisitionAmount: row[6],       // 取得金額
            valuation: row[7],               // 評価額
            profitLoss: row[8],              // 損益損益
          }
          datas.value.push(data);
        }
      })
    }
  })
  if (saveFlag.value && csvDate.value) {
    // firestoreに登録する
    try {
      const batchPromises = datas.value.map(async (data) => {
        // データ登録前にユーザーIDとcsv日付を付与する
        data.userId = "u0001";
        data.csvDate = csvDate.value.replaceAll("-", "");
        await addDoc(collection($db, COLLECTION_NAME), data);
      })
      // すべての非同期処理の終了を待つ
      await Promise.all(batchPromises);
    } catch(error) {
      console.error("Firestoreへの登録中にエラーが発生しました:", error);
    }
  }
}

/**
 * 選択した過去日の保有証券一覧をテーブルに表示する
 */
const showPastData = function() {
  headers.value = headerColumns;
  datas.value = groupedData.value[selectedDate.value];
}

/**
 * 損益のあるデータに色付けのためのクラスを付与する\
 * プラスの場合：緑色\
 * マイナスの場合：赤色\
 * を設定する
 */
const setTextColor = function(val) {
  if (val.includes('+')) return 'text-green';
  if (val.includes('-')) return 'text-red';
  return 'text-default';
}

let headers = ref([]);
let datas = ref([]);
let dataType = ref("1");
let saveFlag = ref(false);
let uploadFile = ref(null);
let csvDate = ref()
let selectedDate = ref()
const headerColumns = [
  { title: '銘柄コード',     align: 'start', key: 'stockCode' },
  { title: '銘柄名称',       align: 'start', key: 'stockName' },
  { title: '保有株数',       align: 'start', key: 'quantity' },
  { title: '取得単価',       align: 'start', key: 'acquisitionPrice' },
  { title: '現在値',         align: 'start', key: 'currentPrice' },
  { title: '取得金額',       align: 'start', key: 'acquisitionAmount' },
  { title: '評価額',         align: 'start', key: 'valuation' },
  { title: '評価損益',       align: 'start', key: 'profitLoss' },
]
</script>
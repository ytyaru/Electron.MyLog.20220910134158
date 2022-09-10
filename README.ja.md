[en](./README.md)

# Electron.MyLog

　Electronでつぶやきを保存する。

# デモ

* [デモ](https://ytyaru.github.io/Electron.MyLog.20220906090127/)

# 特徴

* クロスプラットフォームGUIアプリ（[Node.js][], [Electron][]製）
* SQLite3でつぶやきを保存する（[sql.js][]）
* GitHub Pagesでつぶやきサイトを作成できる（[git][], [GitHub API][]）
* 暗号通貨モナコインを投げ銭してもらうボタンを作成する（[mpurse][] API）

[Node.js]:https://nodejs.org/ja/
[Electron]:https://electronjs.org/ja/docs/latest
[sql.js]:https://github.com/sql-js/sql.js/
[mpurse]:https://github.com/tadajam/mpurse
[git]:https://ja.wikipedia.org/wiki/Git
[GitHub API]:https://docs.github.com/ja/rest

# 開発環境

* <time datetime="2022-09-06T09:01:21+0900">2022-09-06</time>
* [Raspbierry Pi](https://ja.wikipedia.org/wiki/Raspberry_Pi) 4 Model B Rev 1.2
* [Raspberry Pi OS](https://ja.wikipedia.org/wiki/Raspbian) buster 10.0 2020-08-20 <small>[setup](http://ytyaru.hatenablog.com/entry/2020/10/06/111111)</small>
* bash 5.0.3(1)-release
* [Node.js] 16.15.1
* [Electron][] 20
* git 2.20.1
* Chromium 92.0.4515.98（Official Build）Built on Raspbian , running on Raspbian 10 （32 ビット）
* [mpurse][]

```sh
$ uname -a
Linux raspberrypi 5.10.103-v7l+ #1529 SMP Tue Mar 8 12:24:00 GMT 2022 armv7l GNU/Linux
```

# インストール

## git

```sh
sudo apt install -y git
```

## Node.js

```sh
sudo apt-get install -y nodejs npm
sudo npm cache clean
sudo npm install -g n
sudo n stable
sudo apt-get purge -y nodejs npm
```

　新しい端末を開いてバージョンを確認する。

```sh
node -v
npm -v
```

## このアプリ

```sh
NAME='Electron.MyLog.20220906090127'
git clone https://github.com/ytyaru/$NAME
cd $NAME
npm install
npm start
```

# 準備

## アカウント・トークン作成

1. [GitHubアカウント][]を作成する
1. `repo`スコープ権限をもった[アクセストークン][]を作成する

[GitHubアカウント]:https://github.com/join
[アクセストークン]:https://github.com/settings/tokens

## 設定

### `db/setting.json`初回作成

1. [インストール＆実行](#このアプリ)してアプリ終了する
1. `db/setting.json`ファイルが自動作成される

### `db/setting.json`セット

　`db/setting.json`に以下をセットしファイル保存する

プロパティ名|デフォルト値|概要
------------|------------|----
`mona.address`|-|暗号通貨モナコインのアドレス
`github.username`|`git config --global user.name`|GitHubユーザ名
`github.email`|`git config --global user.email`|GitHubメールアドレス
`github.token`|-|[アクセストークン][]（`repo`スコープ権限付）
`github.repo.name`|`{ルートディレクトリ名}.Site`|リポジトリ名
`github.repo.description`|`著者のつぶやきサイトです。`|リポジトリ説明文
`github.repo.homepage`|`https://${username}.github.io/${repo.name}/`（初回push時に空なら自動付与）|リポジトリ関連URL
`github.repo.topics`|`["website"]`|任意トピックス

### リポジトリ状態

1. `dst/mytestrepo/.git`が存在しないことを確認する（あれば`dst`ごと削除する）
1. GitHub上に同名リモートリポジトリが存在しないことを確認する（あれば削除か別名にする）

# 使い方

　[インストール](#インストール)、[準備](#準備)、[設定](#設定)を終え、アプリを起動したあとの使い方。

## つぶやく

1. テキストエリアに任意のテキストを入力する
1. <kbd>つぶやく</kbd>ボタンを押す
1. GitHubに`push`される

### 制限

* 140字以内であること
* 15行以内であること

### HTML

　テキストがURLの場合はHTMLとしてマークアップされる。

種別|HTML|概要|正規表現
----|----|----|--------
URL(https)|`<a href="${text}">${text}</a>`|以下以外のURLらしき文字列すべて|`/((h?)(ttps?:\/\/[a-zA-Z0-9.\-_@:/~?%&;=+#',()*!]+))/g; // ']))/`
URL(ipfs)|`<a href="${text}">${text}</a>`|以下以外のURLらしき文字列すべて|`/((ipfs?:\/\/[a-zA-Z0-9.\-_@:/~?%&;=+#',()*!]+))/g; // ']))/`
画像|`<img src="${text}">`|URL末尾の拡張子が画像らしきURL|`/((https?:\/\/[a-zA-Z0-9.\-_@:/~?%&;=+#',()*!]+\.(png\|gif\|jpg\|jpeg\|webp\|avif)))/g; // ']))/`
音声|`<audio controls width="320" src="${text}"></audio>`|URL末尾の拡張子が音声らしきURL|`/((https?:\/\/[a-zA-Z0-9.\-_@:/~?%&;=+#',()*!]+\.(wav\|mp3\|ogg\|flac\|wma\|aiff\|aac\|m4a)))/g; // ']))/`
動画|`<video controls width="320" src="${text}"></video>`|URL末尾の拡張子が動画らしきURL|`/((https?:\/\/[a-zA-Z0-9.\-_@:/~?%&;=+#',()*!]+\.(mp4\|avi\|wmv\|mpg\|flv\|mov\|webm\|mkv\|asf)))/g; // ']))/`
YouTube|`<iframe width="320" height="240" src="https://www.youtube.com/embed/${match[1]}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`|URLがYouTubeらしきURL|`/https:\/\/www.youtube.com\/watch\?v=([a-zA-Z0-9.\-_@:/~?%&;=+#',()*!]+)/`

### 投げモナボタン

　つぶやき一件ごとに投げモナボタンを表示することができる。

　そのためには`db/setting.json`の`mona.address`に暗号通貨モナコインのアドレスがセットされている必要がある。

　ただし投げモナボタンはHTTPS上でないと起動しない。よってElectronアプリ上では動作しない。後述するGitHub Pagesにデプロイしたあと、そこで機能する。もちろん[mpurse][]をインストールしている必要がある。

## つぶやき削除

1. 削除したいつぶやきの☒ボタンにチェックする
1. <kbd>削除</kbd>ボタンを押す
1. 確認ダイアログで<kbd>OK</kbd>ボタンを押す

　なお、ひとつもチェックしなければ***全件削除***になるので注意。

# GitHub Pages デプロイ

　1件以上[つぶやく](#つぶやく)したら、それを表示するサイトをGitHub Pagesに展開する。

1. アップロードしたユーザのリポジトリページにアクセスする（`https://github.com/ユーザ名/リポジトリ名`）
1. 設定ページにアクセスする（`https://github.com/ユーザ名/リポジトリ名/settings`）
1. `Pages`ページにアクセスする（`https://github.com/ユーザ名/リポジトリ名/settings/pages`）
    1. `Source`のコンボボックスが`Deploy from a branch`になっていることを確認する
    1. `Branch`を`master`にし、ディレクトリを`/(root)`にし、<kbd>Save</kbd>ボタンを押す
    1. <kbd>F5</kbd>キーでリロードし、そのページに`https://ytyaru.github.io/リポジトリ名/`のリンクが表示されるまでくりかえす（***数分かかる***）
    1. `https://ytyaru.github.io/リポジトリ名/`のリンクを参照する（デプロイ完了してないと404エラー）

　すべて完了したリポジトリとそのサイトの例が以下。

* [作成DEMO][]
* [作成リポジトリ][]

[作成DEMO]:https://ytyaru.github.io/Electron.simple.git.Upload.Test.20220902105438/
[作成リポジトリ]:https://github.com/ytyaru/Electron.simple.git.Upload.Test.20220902105438

　もしブラウザ拡張機能[mpurse][]がインストールされており、`db/setting.json`の`mona.address`がセットされていたら、つぶやき一件ごとに投げモナボタンが表示され、機能する。

# 著者

　ytyaru

* [![github](http://www.google.com/s2/favicons?domain=github.com)](https://github.com/ytyaru "github")
* [![hatena](http://www.google.com/s2/favicons?domain=www.hatena.ne.jp)](http://ytyaru.hatenablog.com/ytyaru "hatena")
* [![twitter](http://www.google.com/s2/favicons?domain=twitter.com)](https://twitter.com/ytyaru1 "twitter")
* [![mastodon](http://www.google.com/s2/favicons?domain=mstdn.jp)](https://mstdn.jp/web/accounts/233143 "mastdon")

# ライセンス

　このソフトウェアはCC0ライセンスである。

[![CC0](http://i.creativecommons.org/p/zero/1.0/88x31.png "CC0")](http://creativecommons.org/publicdomain/zero/1.0/deed.ja)


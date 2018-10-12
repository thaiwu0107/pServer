-- phpMyAdmin SQL Dump
-- version 4.7.9
-- https://www.phpmyadmin.net/
--
-- 主機: 127.0.0.1:3306
-- 產生時間： 2018 年 09 月 03 日 07:13
-- 伺服器版本: 5.7.21
-- PHP 版本： 7.2.4
-- Schema version 0.0.15

use porkerdb;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- 資料庫： `porkerdb`
--

-- --------------------------------------------------------

--
-- 資料表結構 `game_rule_mapping`
--

DROP TABLE IF EXISTS `game_rule_mapping`;
CREATE TABLE IF NOT EXISTS `game_rule_mapping` (
  `id` INT unsigned NOT NULL AUTO_INCREMENT COMMENT '流水號',
  `name` varchar(10) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT '英文簡寫(T、N、P、O)',
  `description` varchar(30) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT '描述(Teen Patti、NLH、PLO、OFG)',
  PRIMARY KEY (`id`),
  KEY (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='遊戲類別';

--
-- 資料表的匯出資料 `game_rule_mapping`
--

INSERT INTO `game_rule_mapping` (`id`, `name`, `description`) VALUES
(0, 'NON', 'unknow'),
(1, 'T', 'Teen Patti 短牌'),
(2, 'N', 'NLH 無限注德州'),
(3, 'O', 'PLO 奧瑪哈'),
(4, 'P', 'OFG 不知道');

-- --------------------------------------------------------

--
-- 資料表結構 `nlh_rule`
--

DROP TABLE IF EXISTS `nlh_rule`;
CREATE TABLE IF NOT EXISTS `nlh_rule` (
  `id` SERIAL COMMENT '流水號(規則代號)',
  `tc_sb` DECIMAL(15,4) NOT NULL COMMENT '小盲注(small blind)',
  `tc_bb` DECIMAL(15,4) NOT NULL COMMENT '大盲注(big blind)',
  `tc_minbet` DECIMAL(15,4) NOT NULL COMMENT '最低攜入籌碼',
  `tc_maxbet` DECIMAL(15,4) NOT NULL COMMENT '最高攜入籌碼',
  `tc_sec` SMALLINT unsigned NOT NULL COMMENT '思考秒數',
  `tc_countDown` SMALLINT unsigned DEFAULT '10' COMMENT '牌局開始倒數秒數',
  `tc_seat` SMALLINT unsigned NOT NULL COMMENT '幾人桌(2, 6, 9)',
  `tc_multdeal` TINYINT DEFAULT '0' COMMENT '發多次牌',
  `tc_insurance` TINYINT DEFAULT '0' COMMENT '保險',
  `tc_rake` float DEFAULT '0' COMMENT '佣金/抽水/服務費 %數',
  `tc_toprake` float DEFAULT '0.0' COMMENT '封頂',
  `tc_buyin` TINYINT DEFAULT '0' COMMENT '是否買入',
  `tc_gps` TINYINT DEFAULT '0' COMMENT 'GPS',
  `tc_ip` TINYINT DEFAULT '0' COMMENT 'IP',
  `tc_table_time` INT unsigned DEFAULT '0' COMMENT '總時長(秒)',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='賭桌設定';

-- --------------------------------------------------------

--
-- 資料表結構 `player_record`
--

DROP TABLE IF EXISTS `player_record`;
CREATE TABLE IF NOT EXISTS `player_record` (
  `id` SERIAL COMMENT '流水號',
  `um_id` BIGINT unsigned NOT NULL COMMENT '玩家ID (UM_No)',
  `pr_sessionRecordID` BIGINT unsigned NOT NULL COMMENT '牌局號(session_record.id)',
  `pr_roundStatusID` TINYINT unsigned NOT NULL COMMENT '狀態(round_status.id)',
  `pr_handsAmount` DECIMAL(20,5) NOT NULL COMMENT '玩家手上原有的籌碼(不扣當下下注額)',
  `pr_seat` SMALLINT unsigned DEFAULT '0' COMMENT '座位',
  `pr_hands` json NOT NULL COMMENT '手牌',
  `pr_costTime` SMALLINT unsigned DEFAULT '0' COMMENT '玩家實際思考秒數',
  `pr_bet` DECIMAL(20,5) NOT NULL COMMENT '下注金額',
  `pr_action` TINYINT unsigned DEFAULT '0' COMMENT '動作(1:CALL 2:RAISE 3:ALLIN 4:FOLD 5:CHECK 0:UNKNOW) (game_action_mapping.id)',
  `pr_deskBetPool` DECIMAL(20,5) DEFAULT '0' COMMENT '池底當下金額(不包含當下下注金額)',
  `pr_insurance` DECIMAL(20,5) DEFAULT '0' COMMENT '保險籌碼',
  `pr_diamond` DECIMAL(20,5) DEFAULT '0' COMMENT '鑽石',
  PRIMARY KEY (`id`),
  KEY (`um_id`),
  KEY (`pr_sessionRecordID`),
  KEY (`pr_roundStatusID`),
  KEY (`pr_sessionRecordID`,`pr_roundStatusID`),
  KEY (`pr_sessionRecordID`,`um_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='玩家歷史紀錄';


--
-- 資料表結構 `game_action_mapping`
--

DROP TABLE IF EXISTS `game_action_mapping`;
CREATE TABLE IF NOT EXISTS `game_action_mapping` (
  `id` INT unsigned NOT NULL AUTO_INCREMENT COMMENT '流水號',
  `actionName` varchar(10) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT '動作',
  `description` varchar(30) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT '描述',
  PRIMARY KEY (`id`),
  KEY (`actionName`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='遊戲動作';

--
-- 資料表的匯出資料 `game_rule_mapping`
--

INSERT INTO `game_action_mapping` (`id`, `actionName`, `description`) VALUES
(0, 'NON', 'unknow'),
(1, 'CALL', '跟注'),
(2, 'RAISE', '加注'),
(3, 'ALLIN', '梭哈'),
(4, 'FOLD', '放棄'),
(5, 'CHECK', '看牌');

-- --------------------------------------------------------

--
-- 資料表結構 `round_status`
--

DROP TABLE IF EXISTS `round_status`;
CREATE TABLE IF NOT EXISTS `round_status` (
  `id` INT unsigned NOT NULL AUTO_INCREMENT COMMENT '流水號(狀態號)',
  `rs_description` varchar(30) COLLATE utf8_unicode_ci NOT NULL COMMENT '狀態說明 {\n  "0": ''pre-flop'',\n  "1": ''flop'',\n  "2": ''turn'',\n  "3": ''river'',\n  "4": ''unusual''\n}',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='狀態';

--
-- 資料表的匯出資料 `round_status`
--

INSERT INTO `round_status` (`id`, `rs_description`) VALUES
(0, 'unknow'),
(1, 'pre-flop'),
(2, 'flop'),
(3, 'turn'),
(4, 'river'),
(5, 'unusual');

-- --------------------------------------------------------

--
-- 資料表結構 `session_record`
--

DROP TABLE IF EXISTS `session_record`;
CREATE TABLE IF NOT EXISTS `session_record` (
  `id` SERIAL COMMENT '牌局號 (流水號 table_status.ts_session)',
  `sr_tableConfigID` INT unsigned NOT NULL COMMENT '規則代號(table_config.id)',
  `sr_tableStatusID` INT unsigned NOT NULL COMMENT '賭桌號碼(table_status.id)',
  `sr_tableTypeID` INT unsigned NOT NULL COMMENT '賭桌型態(table_type.id)',
  `sr_startTime` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '牌局開始時間',
  `sr_endTime` timestamp NULL DEFAULT NULL COMMENT '牌局結束時間',
  `sr_castTime` INT unsigned DEFAULT '0' COMMENT '牌局耗時',
  `sr_pot` DECIMAL(20,5) DEFAULT '0.0' COMMENT '底池的金錢總額',
  `sr_rake` DECIMAL(20,5) DEFAULT '0.0' COMMENT '底池的抽水金錢總額',
  `sr_hosterPosition` SMALLINT unsigned DEFAULT '0' COMMENT '莊家位置',
  `sr_smallBlindPosition` SMALLINT unsigned DEFAULT '0' COMMENT '小盲位置',
  `sr_bigBlindPosition` SMALLINT unsigned DEFAULT '0' COMMENT '大盲位置',
  `sr_winnerID` varchar(20) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT '贏家ID',
  `sr_seat` SMALLINT unsigned DEFAULT '0' COMMENT '贏家翻牌後最後行動的位置(按鈕)',
  PRIMARY KEY (`id`),
  KEY (`sr_tableConfigID`,`sr_tableStatusID`,`sr_tableTypeID`),
  KEY (`sr_tableStatusID`,`sr_tableConfigID`),
  KEY (`sr_tableStatusID`),
  KEY (`sr_tableConfigID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='牌局紀錄';

-- --------------------------------------------------------

--
-- 資料表結構 `table_rule_mapping`
--

DROP TABLE IF EXISTS `table_rule_mapping`;
CREATE TABLE IF NOT EXISTS `table_rule_mapping` (
  `id` INT unsigned NOT NULL AUTO_INCREMENT COMMENT '流水號',
  `name` varchar(10) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT '英文簡寫(N、V、C、G)',
  `description` varchar(30) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT '描述( Normal、VIP、Club、Challenge)',
  PRIMARY KEY (`id`),
  key (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='桌子類別';

--
-- 資料表的匯出資料 `table_rule_mapping`
--

INSERT INTO `table_rule_mapping` (`id`, `name`, `description`) VALUES
(0, 'NON', 'unknow'),
(1, 'N', 'Normal'),
(2, 'V', 'VIP'),
(3, 'C', 'Club'),
(4, 'G', 'Challenge');

-- --------------------------------------------------------

--
-- 資料表結構 `table_status`
--

DROP TABLE IF EXISTS `table_status`;
CREATE TABLE IF NOT EXISTS `table_status` (
  `id` SERIAL COMMENT '流水號',
  `ts_session` BIGINT unsigned DEFAULT NULL COMMENT '局號(session_record.id)',
  `ts_ruleid` BIGINT unsigned NOT NULL COMMENT '規則(nlh_rule.id)',
  `ts_type` BIGINT unsigned NOT NULL COMMENT '桌子型態(table_type.id)',
  `ts_table` INT unsigned DEFAULT NULL COMMENT '桌號',
  `ts_name` varchar(100) COLLATE utf8_unicode_ci NOT NULL COMMENT '牌桌名稱',
  `ts_status` TINYINT unsigned NOT NULL COMMENT '狀態(1:開啟 0:關閉)',
  `ts_people` TINYINT unsigned NOT NULL COMMENT '人數',
  `ts_start` timestamp NOT NULL COMMENT '開桌時間',
  `ts_end` timestamp NULL DEFAULT NULL COMMENT '關桌時間',
  `ts_close` TINYINT DEFAULT '0' COMMENT '是否正常關閉(0: 代表非正常, 1:代表有被修改過是正常的)',
  PRIMARY KEY (`id`),
  KEY (`ts_table`, `ts_ruleid`, `ts_type`),
  KEY (`ts_ruleid`, `ts_type`),
  KEY (`ts_table`, `ts_ruleid`),
  KEY (`ts_table`, `ts_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='賭桌狀態';

-- --------------------------------------------------------

--
-- 資料表結構 `table_type`
--

DROP TABLE IF EXISTS `table_type`;
CREATE TABLE IF NOT EXISTS `table_type` (
  `id` INT unsigned NOT NULL AUTO_INCREMENT COMMENT '流水號',
  `tt_game` varchar(10) COLLATE utf8_unicode_ci NOT NULL COMMENT '遊戲類型(game_rule_mapping.name)',
  `tt_gameID` SMALLINT NOT NULL COMMENT '遊戲類型(game_rule_mapping.id)',
  `tt_type` varchar(10) COLLATE utf8_unicode_ci NOT NULL COMMENT '桌子類型(table_rule_mapping.name)',
  `tt_typeID` SMALLINT NOT NULL COMMENT '桌子類型(table_rule_mapping.id)',
  `tt_description` varchar(20) COLLATE utf8_unicode_ci NOT NULL COMMENT '說明',
  PRIMARY KEY (`id`),
  KEY (`tt_gameID`),
  KEY (`tt_typeID`),
  KEY (`tt_type`),
  KEY (`tt_game`),
  KEY (`tt_gameID`, `tt_typeID`),
  KEY (`tt_game`, `tt_type`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='賭桌型別';

--
-- 資料表的匯出資料 `table_type`
--

INSERT INTO `table_type` (`id`, `tt_game`, `tt_gameID`, `tt_type`, `tt_typeID`, `tt_description`) VALUES
(0, 'NON', 0, 'NON', 0, 'unknow'),
(1, 'T', 1, 'N', 1, 'Teen Patti Normal'),
(2, 'T', 1, 'V', 2, 'Teen Patti VIP'),
(3, 'T', 1, 'C', 3, 'Teen Patti Club'),
(4, 'T', 1, 'G', 4, 'Teen Patti Challenge'),
(5, 'N', 2, 'N', 1, 'NLH Normal'),
(6, 'N', 2, 'V', 2, 'NLH VIP'),
(7, 'N', 2, 'C', 3, 'NLH Club'),
(8, 'N', 2, 'G', 4, 'NLH Challenge'),
(9, 'P', 3, 'N', 1, 'PLO Normal'),
(10, 'P', 3, 'V', 2, 'PLO VIP'),
(11, 'P', 3, 'C', 3, 'PLO Club'),
(12, 'P', 3, 'G', 4, 'PLO Challenge'),
(13, 'O', 4, 'N', 1, 'OFG Normal'),
(14, 'O', 4, 'V', 2, 'OFG VIP'),
(15, 'O', 4, 'C', 3, 'OFG Club'),
(16, 'O', 4, 'G', 4, 'OFG Challenge');

-- --------------------------------------------------------

--
-- 資料表結構 `ts_usermember`
--

DROP TABLE IF EXISTS `ts_usermember`;
CREATE TABLE IF NOT EXISTS `ts_usermember` (
  `UM_No` SERIAL COMMENT '流水編號',
  `UM_Vip` TINYINT(1) DEFAULT '0' COMMENT '會員VIP',
  `UM_Agent` int(11) NOT NULL DEFAULT '0' COMMENT '上層編號',
  `UM_UpLevel` json NOT NULL COMMENT '上層資料',
  `UM_Level` TINYINT(4) NOT NULL COMMENT '所在層級',
  `UM_IsAgent` TINYINT(1) NOT NULL DEFAULT '0' COMMENT '是否為代理 (0: 否，1: 是)',
  `UM_LowerWater` TINYINT(1) NOT NULL DEFAULT '0' COMMENT '下級返水 (只有線頭) (0: 否，1: 是)',
  `UM_Account` varchar(20) COLLATE utf8_unicode_ci NOT NULL COMMENT '帳號',
  `UM_Sex` TINYINT(1) DEFAULT '0' COMMENT '性別 (0: 男 / 1: 女)',
  `UM_PayoutPassword` varchar(20) COLLATE utf8_unicode_ci NOT NULL COMMENT '提款密碼',
  `UM_Password` varchar(20) COLLATE utf8_unicode_ci NOT NULL COMMENT '密碼',
  `UM_RealName` varchar(20) COLLATE utf8_unicode_ci NOT NULL COMMENT '真實姓名',
  `UM_NickName` varchar(20) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT '暱稱',
  `UM_Email` varchar(100) COLLATE utf8_unicode_ci DEFAULT '' COMMENT '會員信箱',
  `UM_Birthday` int(11) DEFAULT '0' COMMENT '生日',
  `UM_Config` json NOT NULL COMMENT '個人設定(單筆每日存提款之類)',
  `UM_Avatar` varchar(250) COLLATE utf8_unicode_ci DEFAULT '' COMMENT '個人圖片',
  `UM_Tag` json DEFAULT NULL COMMENT '會員標籤',
  `UM_PromotionLink` varchar(500) COLLATE utf8_unicode_ci NOT NULL DEFAULT '' COMMENT '推廣連結(代理自開無)',
  `UM_UserGroupId` int(11) NOT NULL COMMENT '用戶組ID',
  `UM_BonusGroup` SMALLINT(4) NOT NULL COMMENT '獎金組',
  `UM_URL` varchar(100) COLLATE utf8_unicode_ci DEFAULT '' COMMENT '代理網址',
  `UM_Layout` SMALLINT(6) DEFAULT '1' COMMENT '版型編號',
  `UM_ProfitType` TINYINT(1) NOT NULL COMMENT '佣金模式 (0：無 /1：提成 / 2: 打碼量)',
  `UM_ProfitTypeAuto` TINYINT(1) NOT NULL DEFAULT '0' COMMENT '自動派發佣金(0: 否 / 1: 是)',
  `UM_ProfitTypeId` int(11) NOT NULL DEFAULT '0' COMMENT '佣金模式ID (TS_ProfitType)',
  `UM_ProfitLastTime` int(11) NOT NULL DEFAULT '0' COMMENT '提成打碼待遇最後派發時間',
  `UM_Point` DECIMAL(20,5) NOT NULL DEFAULT '0.0000' COMMENT '剩餘點數',
  `UM_PromotionPoint` DECIMAL(20,5) DEFAULT '0.000' COMMENT '優惠點數',
  `UM_BetCount` DECIMAL(20,5) DEFAULT '0.000' COMMENT '現在打碼量',
  `UM_BetCountStandard` DECIMAL(20,5) DEFAULT '0.000' COMMENT '提款必須打碼量',
  `UM_TotalWinnings` DECIMAL(20,5) NOT NULL DEFAULT '0.0000' COMMENT '累計中獎金額',
  `UM_TotalBankIn` DECIMAL(20,5) NOT NULL DEFAULT '0.000' COMMENT '公司入款金額總計',
  `UM_TotalBankOut` DECIMAL(20,5) NOT NULL DEFAULT '0.000' COMMENT '公司出款金額總計',
  `UM_TotalThreePayIn` DECIMAL(20,5) NOT NULL DEFAULT '0.000' COMMENT '第三方入款金額總計',
  `UM_TotalThreePayOut` DECIMAL(20,5) NOT NULL DEFAULT '0.000' COMMENT '第三方出款金額總計',
  `UM_TotalPromotions` DECIMAL(20,5) NOT NULL DEFAULT '0.000' COMMENT '優惠總計',
  `UM_TotalBetCount` DECIMAL(20,5) NOT NULL DEFAULT '0.000' COMMENT '打碼量總計',
  `UM_TotalBet` DECIMAL(20,5) NOT NULL DEFAULT '0.000' COMMENT '下注總計',
  `UM_BetTimes` int(10) NOT NULL DEFAULT '0' COMMENT '下注總次數',
  `UM_BankInTimes` int(10) NOT NULL DEFAULT '0' COMMENT '公司存款總次數',
  `UM_ThreePayInTimes` int(10) NOT NULL DEFAULT '0' COMMENT '第三方存款總次數',
  `UM_BankOutTimes` int(10) NOT NULL DEFAULT '0' COMMENT '公司提款總次數',
  `UM_ThreePayOutTimes` int(10) NOT NULL DEFAULT '0' COMMENT '第三方提款總次數',
  `UM_PromotionsTimes` int(10) NOT NULL DEFAULT '0' COMMENT '優惠總次數',
  `UM_FirstDeposite` int(11) DEFAULT '0' COMMENT '首充時間',
  `UM_Mobile` varchar(20) COLLATE utf8_unicode_ci NOT NULL DEFAULT '' COMMENT '行動號碼',
  `UM_Wechat` varchar(20) COLLATE utf8_unicode_ci DEFAULT '' COMMENT '微信號',
  `UM_QQ` varchar(20) COLLATE utf8_unicode_ci DEFAULT '' COMMENT 'QQ號',
  `UM_BankAccount` json DEFAULT NULL COMMENT '銀行資訊',
  `UM_Remark` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT '備註',
  `UM_Device` varchar(20) COLLATE utf8_unicode_ci DEFAULT '' COMMENT '使用設備',
  `UM_Token` varchar(250) COLLATE utf8_unicode_ci DEFAULT '' COMMENT 'token (推播用)',
  `UM_RegIP` bigint(20) DEFAULT '0' COMMENT '註冊IP',
  `UM_RegDevice` varchar(20) COLLATE utf8_unicode_ci DEFAULT '' COMMENT '註冊裝置',
  `UM_RegBrowser` varchar(20) COLLATE utf8_unicode_ci DEFAULT '' COMMENT '註冊瀏覽器',
  `UM_RegLocation` varchar(20) COLLATE utf8_unicode_ci DEFAULT '' COMMENT '註冊所在地',
  `UM_PreviousLoginIP` bigint(20) UNSIGNED DEFAULT '0' COMMENT '前次登入IP',
  `UM_PreviousLoginDevice` varchar(20) COLLATE utf8_unicode_ci DEFAULT '' COMMENT '前次使用設備',
  `UM_PreviousLoginBrowser` varchar(20) COLLATE utf8_unicode_ci DEFAULT '' COMMENT '前次使用瀏覽器',
  `UM_PreviousLoginLocation` varchar(20) COLLATE utf8_unicode_ci DEFAULT '' COMMENT '前次登入所在地',
  `UM_LastLoginIP` bigint(20) UNSIGNED DEFAULT '0' COMMENT '最後登入IP',
  `UM_LastLoginDevice` varchar(20) COLLATE utf8_unicode_ci DEFAULT '' COMMENT '最後使用設備',
  `UM_LastLoginBrowser` varchar(20) COLLATE utf8_unicode_ci DEFAULT '' COMMENT '最後使用瀏覽器',
  `UM_LastLoginLocation` varchar(20) COLLATE utf8_unicode_ci DEFAULT '0' COMMENT '最後登入所在地',
  `UM_FirstLoginDate` int(11) DEFAULT '0' COMMENT '首次登入時間',
  `UM_PreviousLoginDate` int(11) DEFAULT '0' COMMENT '前次登入時間',
  `UM_LastLoginDate` int(11) DEFAULT '0' COMMENT '最後登入時間',
  `UM_Review` TINYINT(1) NOT NULL COMMENT '審核狀態 (0: 未審核 / 1: 已核准 / 2: 未核准)',
  `UM_Freeze` TINYINT(1) NOT NULL COMMENT '凍結 (0: 非凍結 / 1: 凍結)',
  `UM_Bet` TINYINT(1) NOT NULL COMMENT '可否下注 (0: 不可下注 / 1: 可下注)',
  `UM_Enable` TINYINT(1) NOT NULL COMMENT '狀態 (0: 停用 / 1: 啟用)',
  `UM_ClearBetCount` int(11) NOT NULL DEFAULT '0' COMMENT '清除稽核時間點 (最後的提款申請時間)',
  `UM_DateCreate` int(11) NOT NULL COMMENT '建立時間',
  `UM_DateUpdate` int(11) NOT NULL DEFAULT '0' COMMENT '更新時間',
  `UM_goldpoint` DECIMAL(20,5) NOT NULL COMMENT '鑽石',
  `UM_EnergyPoint` DECIMAL(20,5) NOT NULL COMMENT '能量',
  `UM_MemoryNlhruleId` bigint NOT NULL DEFAULT '0' COMMENT '自動記憶上次開局設定',
  PRIMARY KEY (`UM_No`),
  KEY `UM_Account` (`UM_Account`) USING BTREE,
  KEY `UM_Level` (`UM_Level`),
  KEY `UM_Agent` (`UM_Agent`),
  KEY `UM_LowerWater` (`UM_LowerWater`),
  KEY `UM_RealName` (`UM_RealName`),
  KEY `UM_Email` (`UM_Email`),
  KEY `UM_Agent_2` (`UM_Agent`),
  KEY `UM_UserGroupId` (`UM_UserGroupId`),
  KEY `UM_BonusGroup` (`UM_BonusGroup`),
  KEY `UM_ProfitType` (`UM_ProfitType`),
  KEY `UM_ProfitTypeAuto` (`UM_ProfitTypeAuto`),
  KEY `UM_ProfitTypeId` (`UM_ProfitTypeId`),
  KEY `UM_Point` (`UM_Point`),
  KEY `UM_BetCount` (`UM_BetCount`),
  KEY `UM_BetCountStandard` (`UM_BetCountStandard`),
  KEY `UM_Review` (`UM_Review`),
  KEY `UM_Freeze` (`UM_Freeze`),
  KEY `UM_Bet` (`UM_Bet`),
  KEY `UM_Enable` (`UM_Enable`),
  KEY `UM_ClearBetCount` (`UM_ClearBetCount`),
  KEY `UM_DateCreate` (`UM_DateCreate`),
  KEY `UM_DateUpdate` (`UM_DateUpdate`),
  KEY `UM_FirstDeposite` (`UM_FirstDeposite`),
  KEY `UM_RegIP` (`UM_RegIP`)
) ENGINE=InnoDB AUTO_INCREMENT=58 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- 資料表的匯出資料 `ts_usermember`
--

INSERT INTO `ts_usermember` (`UM_No`, `UM_Vip`, `UM_Agent`, `UM_UpLevel`, `UM_Level`, `UM_IsAgent`, `UM_LowerWater`, `UM_Account`, `UM_Sex`, `UM_PayoutPassword`, `UM_Password`, `UM_RealName`, `UM_NickName`, `UM_Email`, `UM_Birthday`, `UM_Config`, `UM_Avatar`, `UM_Tag`, `UM_PromotionLink`, `UM_UserGroupId`, `UM_BonusGroup`, `UM_URL`, `UM_Layout`, `UM_ProfitType`, `UM_ProfitTypeAuto`, `UM_ProfitTypeId`, `UM_ProfitLastTime`, `UM_Point`, `UM_PromotionPoint`, `UM_BetCount`, `UM_BetCountStandard`, `UM_TotalWinnings`, `UM_TotalBankIn`, `UM_TotalBankOut`, `UM_TotalThreePayIn`, `UM_TotalThreePayOut`, `UM_TotalPromotions`, `UM_TotalBetCount`, `UM_TotalBet`, `UM_BetTimes`, `UM_BankInTimes`, `UM_ThreePayInTimes`, `UM_BankOutTimes`, `UM_ThreePayOutTimes`, `UM_PromotionsTimes`, `UM_FirstDeposite`, `UM_Mobile`, `UM_Wechat`, `UM_QQ`, `UM_BankAccount`, `UM_Remark`, `UM_Device`, `UM_Token`, `UM_RegIP`, `UM_RegDevice`, `UM_RegBrowser`, `UM_RegLocation`, `UM_PreviousLoginIP`, `UM_PreviousLoginDevice`, `UM_PreviousLoginBrowser`, `UM_PreviousLoginLocation`, `UM_LastLoginIP`, `UM_LastLoginDevice`, `UM_LastLoginBrowser`, `UM_LastLoginLocation`, `UM_FirstLoginDate`, `UM_PreviousLoginDate`, `UM_LastLoginDate`, `UM_Review`, `UM_Freeze`, `UM_Bet`, `UM_Enable`, `UM_ClearBetCount`, `UM_DateCreate`, `UM_DateUpdate`, `UM_goldpoint`, `UM_EnergyPoint`) VALUES
(0, 1, 0, '{\"0\": \"0\"}', 1, 1, 0, 'Arcadia', 0, '0000', '0857', '世外桃源', NULL, '', 281116800, '{}', '', '[]', '', 1, 1974, '', 1, 0, 0, 0, 0, '9800.6320', '0.000', '0.000', '10200.000', '0.0000', '10000.000', '0.000', '0.000', '0.000', '0.000', '0.000', '0.000', 0, 1, 0, 0, 0, 0, 0, '13077824218', '', '', NULL, NULL, '', '', 0, '', '', '', 1037817889, 'tablet', 'Google Chrome', '台湾', 1990447475, 'Android', 'Google Chrome', '台北市', 1527836213, 1528170232, 1528170241, 1, 0, 0, 1, 0, 1527836186, 1528727009, 900000000000000000, 900000000000000000) ,
(1, 1, 0, '{\"0\": \"0\"}', 1, 1, 0, 'test1', 0, '0000', '0857', 'test1', NULL, '', 281116800, '{}', '', '[]', '', 2, 1974, '', 1, 0, 0, 0, 0, '9800.6320', '0.000', '0.000', '10200.000', '0.0000', '10000.000', '0.000', '0.000', '0.000', '0.000', '0.000', '0.000', 0, 1, 0, 0, 0, 0, 0, '13077824218', '', '', NULL, NULL, '', '', 0, '', '', '', 1037817889, 'tablet', 'Google Chrome', '台湾', 1990447475, 'Android', 'Google Chrome', '台北市', 1527836213, 1528170232, 1528170241, 1, 0, 0, 1, 0, 1527836186, 1528727009, 900000000000000000, 900000000000000000),
(2, 1, 0, '{\"0\": \"0\"}', 1, 1, 0, 'test2', 0, '0000', '0857', 'test2', NULL, '', 281116800, '{}', '', '[]', '', 2, 1974, '', 1, 0, 0, 0, 0, '9800.6320', '0.000', '0.000', '10200.000', '0.0000', '10000.000', '0.000', '0.000', '0.000', '0.000', '0.000', '0.000', 0, 1, 0, 0, 0, 0, 0, '13077824218', '', '', NULL, NULL, '', '', 0, '', '', '', 1037817889, 'tablet', 'Google Chrome', '台湾', 1990447475, 'Android', 'Google Chrome', '台北市', 1527836213, 1528170232, 1528170241, 1, 0, 0, 1, 0, 1527836186, 1528727009, 900000000000000000, 900000000000000000),
(3, 1, 0, '{\"0\": \"0\"}', 1, 1, 0, 'test3', 0, '0000', '0857', 'test3', NULL, '', 281116800, '{}', '', '[]', '', 2, 1974, '', 1, 0, 0, 0, 0, '9800.6320', '0.000', '0.000', '10200.000', '0.0000', '10000.000', '0.000', '0.000', '0.000', '0.000', '0.000', '0.000', 0, 1, 0, 0, 0, 0, 0, '13077824218', '', '', NULL, NULL, '', '', 0, '', '', '', 1037817889, 'tablet', 'Google Chrome', '台湾', 1990447475, 'Android', 'Google Chrome', '台北市', 1527836213, 1528170232, 1528170241, 1, 0, 0, 1, 0, 1527836186, 1528727009, 900000000000000000, 900000000000000000),
(4, 1, 0, '{\"0\": \"0\"}', 1, 1, 0, 'test4', 0, '0000', '0857', 'test4', NULL, '', 281116800, '{}', '', '[]', '', 2, 1974, '', 1, 0, 0, 0, 0, '9800.6320', '0.000', '0.000', '10200.000', '0.0000', '10000.000', '0.000', '0.000', '0.000', '0.000', '0.000', '0.000', 0, 1, 0, 0, 0, 0, 0, '13077824218', '', '', NULL, NULL, '', '', 0, '', '', '', 1037817889, 'tablet', 'Google Chrome', '台湾', 1990447475, 'Android', 'Google Chrome', '台北市', 1527836213, 1528170232, 1528170241, 1, 0, 0, 1, 0, 1527836186, 1528727009, 900000000000000000, 900000000000000000),
(5, 1, 0, '{\"0\": \"0\"}', 1, 1, 0, 'test5', 0, '0000', '0857', 'test5', NULL, '', 281116800, '{}', '', '[]', '', 2, 1974, '', 1, 0, 0, 0, 0, '9800.6320', '0.000', '0.000', '10200.000', '0.0000', '10000.000', '0.000', '0.000', '0.000', '0.000', '0.000', '0.000', 0, 1, 0, 0, 0, 0, 0, '13077824218', '', '', NULL, NULL, '', '', 0, '', '', '', 1037817889, 'tablet', 'Google Chrome', '台湾', 1990447475, 'Android', 'Google Chrome', '台北市', 1527836213, 1528170232, 1528170241, 1, 0, 0, 1, 0, 1527836186, 1528727009, 900000000000000000, 900000000000000000),
(6, 1, 0, '{\"0\": \"0\"}', 1, 1, 0, 'test6', 0, '0000', '0857', 'test6', NULL, '', 281116800, '{}', '', '[]', '', 2, 1974, '', 1, 0, 0, 0, 0, '9800.6320', '0.000', '0.000', '10200.000', '0.0000', '10000.000', '0.000', '0.000', '0.000', '0.000', '0.000', '0.000', 0, 1, 0, 0, 0, 0, 0, '13077824218', '', '', NULL, NULL, '', '', 0, '', '', '', 1037817889, 'tablet', 'Google Chrome', '台湾', 1990447475, 'Android', 'Google Chrome', '台北市', 1527836213, 1528170232, 1528170241, 1, 0, 0, 1, 0, 1527836186, 1528727009, 900000000000000000, 900000000000000000),
(7, 1, 0, '{\"0\": \"0\"}', 1, 1, 0, 'test7', 0, '0000', '0857', 'test7', NULL, '', 281116800, '{}', '', '[]', '', 2, 1974, '', 1, 0, 0, 0, 0, '9800.6320', '0.000', '0.000', '10200.000', '0.0000', '10000.000', '0.000', '0.000', '0.000', '0.000', '0.000', '0.000', 0, 1, 0, 0, 0, 0, 0, '13077824218', '', '', NULL, NULL, '', '', 0, '', '', '', 1037817889, 'tablet', 'Google Chrome', '台湾', 1990447475, 'Android', 'Google Chrome', '台北市', 1527836213, 1528170232, 1528170241, 1, 0, 0, 1, 0, 1527836186, 1528727009, 900000000000000000, 900000000000000000),
(8, 1, 0, '{\"0\": \"0\"}', 1, 1, 0, 'test8', 0, '0000', '0857', 'test8', NULL, '', 281116800, '{}', '', '[]', '', 2, 1974, '', 1, 0, 0, 0, 0, '9800.6320', '0.000', '0.000', '10200.000', '0.0000', '10000.000', '0.000', '0.000', '0.000', '0.000', '0.000', '0.000', 0, 1, 0, 0, 0, 0, 0, '13077824218', '', '', NULL, NULL, '', '', 0, '', '', '', 1037817889, 'tablet', 'Google Chrome', '台湾', 1990447475, 'Android', 'Google Chrome', '台北市', 1527836213, 1528170232, 1528170241, 1, 0, 0, 1, 0, 1527836186, 1528727009, 900000000000000000, 900000000000000000),
(9, 1, 0, '{\"0\": \"0\"}', 1, 1, 0, 'test9', 0, '0000', '0857', 'test9', NULL, '', 281116800, '{}', '', '[]', '', 2, 1974, '', 1, 0, 0, 0, 0, '9800.6320', '0.000', '0.000', '10200.000', '0.0000', '10000.000', '0.000', '0.000', '0.000', '0.000', '0.000', '0.000', 0, 1, 0, 0, 0, 0, 0, '13077824218', '', '', NULL, NULL, '', '', 0, '', '', '', 1037817889, 'tablet', 'Google Chrome', '台湾', 1990447475, 'Android', 'Google Chrome', '台北市', 1527836213, 1528170232, 1528170241, 1, 0, 0, 1, 0, 1527836186, 1528727009, 900000000000000000, 900000000000000000);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

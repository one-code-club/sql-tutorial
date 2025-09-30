"use client";

import { useState, useMemo } from 'react';
import { BlocklyWorkspace } from 'react-blockly';
import * as Blockly from 'blockly/core';
import DarkTheme from '@blockly/theme-dark';
import { javascriptGenerator, Order } from 'blockly/javascript';
import 'blockly/blocks';
import { useAppStore } from '@/store/useAppStore';
import { useTranslation } from '@/lib/translations';

// カスタムブロックの定義
Blockly.defineBlocksWithJsonArray([
    {
        "type": "sql_select",
        "message0": "SELECT %1 %2",
        "args0": [
            {
                "type": "field_checkbox",
                "name": "DISTINCT",
                "checked": false
            },
            {
                "type": "input_value",
                "name": "COLUMNS"
            }
        ],
        "message1": "FROM %1",
        "args1": [
            {
                "type": "input_value",
                "name": "TABLE"
            }
        ],
        "message2": "WHERE %1",
        "args2": [
            {
                "type": "input_value",
                "name": "WHERE",
                "check": "Condition"
            }
        ],
        "nextStatement": null,
        "colour": 230,
        "tooltip": "SELECT statement",
        "helpUrl": ""
    },
    {
        "type": "sql_table",
        "message0": "%1",
        "args0": [
            {
                "type": "field_input",
                "name": "TABLE_NAME",
                "text": "table_name"
            }
        ],
        "output": "String",
        "colour": 20,
        "tooltip": "Table name",
        "helpUrl": ""
    },
    {
        "type": "sql_column",
        "message0": "%1",
        "args0": [
            {
                "type": "field_input",
                "name": "COLUMN_NAME",
                "text": "column_name"
            }
        ],
        "output": "String",
        "colour": 20,
        "tooltip": "Column name",
        "helpUrl": ""
    },
    {
        "type": "sql_compare",
        "message0": "%1 %2 %3",
        "args0": [
            { "type": "input_value", "name": "A" },
            {
                "type": "field_dropdown",
                "name": "OP",
                "options": [
                    ["=", "="], ["!=", "!="], [">", ">"],
                    [">=", ">="], ["<", "<"], ["<=", "<="]
                ]
            },
            { "type": "input_value", "name": "B" }
        ],
        "inputsInline": true,
        "output": "Condition",
        "colour": 210,
        "tooltip": "Comparison operator"
    },
    {
        "type": "sql_logic_operator",
        "message0": "%1 %2 %3",
        "args0": [
            { "type": "input_value", "name": "A", "check": "Condition" },
            {
                "type": "field_dropdown",
                "name": "OP",
                "options": [ ["AND", "AND"], ["OR", "OR"] ]
            },
            { "type": "input_value", "name": "B", "check": "Condition" }
        ],
        "inputsInline": true,
        "output": "Condition",
        "colour": 210,
        "tooltip": "Logical operator"
    },
    {
        "type": "sql_star",
        "message0": "*",
        "output": "String",
        "colour": 20,
        "tooltip": "Select all columns"
    },
    {
        "type": "sql_aggregate_function",
        "message0": "%1 ( %2 )",
        "args0": [
            {
                "type": "field_dropdown",
                "name": "AGGREGATE",
                "options": [ ["MIN", "MIN"], ["MAX", "MAX"], ["COUNT", "COUNT"], ["AVG", "AVG"], ["SUM", "SUM"] ]
            },
            { "type": "input_value", "name": "COLUMN" }
        ],
        "output": "String",
        "colour": 160,
        "tooltip": "Aggregate functions"
    },
    {
        "type": "sql_groupby_item",
        "message0": "%1",
        "args0": [
            { "type": "input_value", "name": "COLUMN" }
        ],
        "output": "String",
        "colour": 290,
        "tooltip": "Group by item"
    },
    {
        "type": "sql_groupby",
        "message0": "GROUP BY %1",
        "args0": [
            { "type": "input_value", "name": "GROUP_BY_VALUE" }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 290,
        "tooltip": "Group by clause"
    },
    {
        "type": "sql_order_by_direction",
        "message0": "%1 %2",
        "args0": [
            { "type": "input_value", "name": "COLUMN" },
            {
                "type": "field_dropdown",
                "name": "DIRECTION",
                "options": [ ["ASC", "ASC"], ["DESC", "DESC"] ]
            }
        ],
        "inputsInline": true,
        "output": "String",
        "colour": 290,
        "tooltip": "Order by column"
    },
    {
        "type": "sql_orderby",
        "message0": "ORDER BY %1",
        "args0": [
            {
                "type": "input_value",
                "name": "ORDER_BY_VALUE"
            }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 290,
        "tooltip": "Order by clause"
    },
    {
        "type": "sql_limit",
        "message0": "LIMIT %1",
        "args0": [
            {
                "type": "input_value",
                "name": "LIMIT",
                "check": "Number"
            }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 260,
        "tooltip": "Limit clause"
    },
    {
        "type": "sql_column_list",
        "message0": "%1 , %2",
        "args0": [
            {
                "type": "input_value",
                "name": "COLUMN1"
            },
            {
                "type": "input_value",
                "name": "COLUMN2"
            }
        ],
        "output": "String",
        "colour": 20,
        "inputsInline": true,
        "tooltip": "List of columns"
    },
    {
        "type": "sql_alias",
        "message0": "%1 AS %2",
        "args0": [
            { "type": "input_value", "name": "EXPR" },
            { "type": "field_input", "name": "ALIAS", "text": "alias_name" }
        ],
        "inputsInline": true,
        "output": "String",
        "colour": 160,
        "tooltip": "Alias expression (expr AS alias)"
    }
]);

// カスタムブロックのSQLジェネレーター
javascriptGenerator.forBlock['sql_select'] = function(block: Blockly.Block) {
    const isDistinct = block.getFieldValue('DISTINCT') === true || block.getFieldValue('DISTINCT') === 'TRUE';
    const columns = javascriptGenerator.valueToCode(block, 'COLUMNS', Order.ATOMIC) || '*';
    const table = javascriptGenerator.valueToCode(block, 'TABLE', Order.ATOMIC) || 'your_table';
    const where = javascriptGenerator.valueToCode(block, 'WHERE', Order.ATOMIC);

    const modifierText = isDistinct ? 'DISTINCT ' : '';
    let code = `SELECT ${modifierText}${columns} FROM ${table}`;
    if (where) {
        code += ` WHERE ${where}`;
    }
    return code;
};

javascriptGenerator.forBlock['sql_table'] = function(block: Blockly.Block) {
    const tableName = block.getFieldValue('TABLE_NAME');
    return [tableName, Order.ATOMIC];
};

javascriptGenerator.forBlock['sql_column'] = function(block: Blockly.Block) {
    const columnName = block.getFieldValue('COLUMN_NAME');
    return [columnName, Order.ATOMIC];
};

javascriptGenerator.forBlock['sql_compare'] = function(block: Blockly.Block) {
    const operator = block.getFieldValue('OP');
    const argument0 = javascriptGenerator.valueToCode(block, 'A', Order.ATOMIC) || 'NULL';
    const argument1 = javascriptGenerator.valueToCode(block, 'B', Order.ATOMIC) || 'NULL';
    const code = `${argument0} ${operator} ${argument1}`;
    return [code, Order.RELATIONAL];
};

javascriptGenerator.forBlock['sql_logic_operator'] = function(block: Blockly.Block) {
    const operator = block.getFieldValue('OP');
    const order = (operator === 'AND') ? Order.LOGICAL_AND : Order.LOGICAL_OR;
    const argument0 = javascriptGenerator.valueToCode(block, 'A', order) || 'FALSE';
    const argument1 = javascriptGenerator.valueToCode(block, 'B', order) || 'FALSE';
    const code = `${argument0} ${operator} ${argument1}`;
    return [code, order];
};

javascriptGenerator.forBlock['sql_star'] = function(block: Blockly.Block) {
    return ['*', Order.ATOMIC];
};

// sql_distinct ブロックは廃止（SELECT のチェックボックスで表現）

javascriptGenerator.forBlock['sql_aggregate_function'] = function(block: Blockly.Block) {
    const aggregate = block.getFieldValue('AGGREGATE');
    const column = javascriptGenerator.valueToCode(block, 'COLUMN', Order.ATOMIC) || 'column';
    const code = `${aggregate}(${column})`;
    return [code, Order.FUNCTION_CALL];
};

javascriptGenerator.forBlock['sql_groupby_item'] = function(block: Blockly.Block) {
    const column = javascriptGenerator.valueToCode(block, 'COLUMN', Order.ATOMIC) || 'column';
    return [column, Order.ATOMIC];
};

javascriptGenerator.forBlock['sql_groupby'] = function(block: Blockly.Block) {
    const value = javascriptGenerator.valueToCode(block, 'GROUP_BY_VALUE', Order.ATOMIC) || 'column';
    return ` GROUP BY ${value}`;
};

javascriptGenerator.forBlock['sql_order_by_direction'] = function(block: Blockly.Block) {
    const column = javascriptGenerator.valueToCode(block, 'COLUMN', Order.ATOMIC) || 'column';
    const direction = block.getFieldValue('DIRECTION');
    const code = `${column} ${direction}`;
    return [code, Order.ATOMIC];
};

javascriptGenerator.forBlock['sql_orderby'] = function(block: Blockly.Block) {
    const value = javascriptGenerator.valueToCode(block, 'ORDER_BY_VALUE', Order.ATOMIC) || 'column';
    return ` ORDER BY ${value}`;
};

javascriptGenerator.forBlock['sql_limit'] = function(block: Blockly.Block) {
    const limit = javascriptGenerator.valueToCode(block, 'LIMIT', Order.ATOMIC) || '10';
    return ` LIMIT ${limit}`;
};

javascriptGenerator.forBlock['sql_column_list'] = function(block: Blockly.Block) {
  const col1 = javascriptGenerator.valueToCode(block, 'COLUMN1', Order.NONE) || '';
  const col2 = javascriptGenerator.valueToCode(block, 'COLUMN2', Order.NONE) || '';
  const code = [col1, col2].filter(c => c).join(', ');
  return [code, Order.ATOMIC];
};

javascriptGenerator.forBlock['sql_alias'] = function(block: Blockly.Block) {
    const expr = javascriptGenerator.valueToCode(block, 'EXPR', Order.NONE) || '';
    const alias = block.getFieldValue('ALIAS') || '';
    const safeAlias = String(alias).replace(/[^a-zA-Z0-9_]/g, '_');
    const code = `${expr} AS ${safeAlias}`;
    return [code, Order.ATOMIC];
};


// ルート: categoryToolbox（カテゴリ表示）
// 翻訳 t に依存するため、ツールボックスはコンポーネント内で生成する

// initialXml は空にし、ワークスペース注入後に手動で初期ブロックを配置する
const initialXml = `
<xml xmlns="https://developers.google.com/blockly/xml"></xml>
`;

type Props = {
  value: string;
  onChange: (v: string) => void;
  onRun?: () => void;
  onSave?: () => void;
  runLabel?: string;
  saveLabel?: string;
  // モード切替用：ワークスペースのXMLを受け取り初期配置に利用
  initialXml?: string;
  // モード切替用：ワークスペース変更時にXMLを親へ伝播
  onWorkspaceXmlChange?: (xml: string | null) => void;
};

export function BlocklyEditor({ value, onChange, onRun, onSave, runLabel, saveLabel, initialXml, onWorkspaceXmlChange }: Props) {
  const [sql, setSql] = useState('');
  const [workspace, setWorkspace] = useState<Blockly.WorkspaceSvg | null>(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string | null>(null);
  
  const language = useAppStore((state) => state.language);
  const t = useTranslation(language);

  // ツールボックス（カテゴリ表示）
  const toolbox = useMemo(() => {
    return {
      kind: 'categoryToolbox',
      contents: [
        {
          kind: 'category',
          name: t.categoryBasic,
          contents: [
            { kind: 'block', type: 'sql_select' },
            { kind: 'block', type: 'sql_table' },
            { kind: 'block', type: 'sql_column' },
            { kind: 'block', type: 'sql_star' },
            { kind: 'block', type: 'sql_alias' },
            { kind: 'block', type: 'sql_column_list' },
          ],
        },
        {
          kind: 'category',
          name: t.categoryFilter,
          contents: [
            { kind: 'block', type: 'sql_compare' },
            { kind: 'block', type: 'sql_logic_operator' },
            { kind: 'block', type: 'text' },
            { kind: 'block', type: 'math_number' },
          ],
        },
        {
          kind: 'category',
          name: t.categoryAggregate,
          contents: [
            { kind: 'block', type: 'sql_aggregate_function' },
            { kind: 'block', type: 'sql_groupby' },
            { kind: 'block', type: 'sql_groupby_item' },
          ],
        },
        {
          kind: 'category',
          name: t.categorySort,
          contents: [
            { kind: 'block', type: 'sql_orderby' },
            { kind: 'block', type: 'sql_order_by_direction' },
          ],
        },
        {
          kind: 'category',
          name: t.categoryLimit,
          contents: [
            { kind: 'block', type: 'sql_limit' },
          ],
        },
      ],
    } as any;
  }, [t]);

  // ワークスペース設定はオブジェクト参照が変わると再注入されるため、useMemoで固定
  const workspaceConfiguration = useMemo(() => ({
    grid: {
      spacing: 20,
      length: 3,
      colour: '#4a5568',
      snap: true,
    },
    theme: DarkTheme,
    sounds: false,
  }) as any, []);

  function workspaceDidChange(workspace: Blockly.WorkspaceSvg) {
    if (!workspace) return;
    try {
        const code = javascriptGenerator.workspaceToCode(workspace);
        setSql(code);
        onChange(code);
        // 変更のたびにXMLを親に通知
        try {
          const dom = Blockly.Xml.workspaceToDom(workspace);
          const xmlText = Blockly.Xml.domToText(dom);
          onWorkspaceXmlChange?.(xmlText);
        } catch (e) {
          // XML取得に失敗した場合はnullを通知
          onWorkspaceXmlChange?.(null);
        }
        // フライアウトが閉じた場合は、選択カテゴリを復元
        try {
          const toolboxApi: any = (workspace as any).getToolbox?.();
          const selected = toolboxApi?.getSelectedItem?.();
          if (!selected && toolboxApi) {
            requestAnimationFrame(() => {
              try {
                const items: any[] = toolboxApi.getToolboxItems?.() ?? [];
                const target = (selectedCategoryName
                  ? items.find((it: any) => it?.getName?.() === selectedCategoryName)
                  : null) ?? items[0];
                if (target && toolboxApi.setSelectedItem) toolboxApi.setSelectedItem(target);
              } catch (err) {
                // noop
              }
            });
          }
        } catch (_) {
          // noop
        }
    } catch (e) {
        console.error(e);
    }
  }

  function handleWorkspaceInjected(ws: Blockly.WorkspaceSvg) {
    setWorkspace(ws);

    // 初期ロード：initialXml があれば適用。なければ SQL からブロックを可能な範囲で構築
    try {
      const hasBlocks = ws.getTopBlocks(false).length > 0;
      if (!hasBlocks) {
        if (initialXml && initialXml.trim()) {
          try {
            const dom = Blockly.Xml.textToDom(initialXml);
            Blockly.Xml.domToWorkspace(dom, ws);
          } catch (e) {
            // XMLが不正でも処理継続
          }
        } else if (value && value.trim()) {
          tryBuildWorkspaceFromSql(ws, value);
        }
      }
    } catch {}

    // 初期コード生成
    const code = javascriptGenerator.workspaceToCode(ws);
    setSql(code);
    onChange(code);
    // 初期XMLも親へ通知
    try {
      const dom = Blockly.Xml.workspaceToDom(ws);
      const xmlText = Blockly.Xml.domToText(dom);
      onWorkspaceXmlChange?.(xmlText);
    } catch {}

    // 初回表示時に「基本」カテゴリを選択
    try {
      const toolboxApi: any = (ws as any).getToolbox?.();
      if (toolboxApi) {
        const items: any[] = toolboxApi.getToolboxItems?.() ?? [];
        const target = items.find((it: any) => it?.getName?.() === t.categoryBasic) ?? items[0];
        if (target && toolboxApi.setSelectedItem) {
          toolboxApi.setSelectedItem(target);
          setSelectedCategoryName(target?.getName?.() ?? null);
        }

        // カテゴリ選択変更を監視
        const originalSetSelectedItem = toolboxApi.setSelectedItem;
        toolboxApi.setSelectedItem = function(item: any) {
          try {
            setSelectedCategoryName(item?.getName?.() ?? null);
          } catch {}
          return originalSetSelectedItem.call(this, item);
        };
      }
    } catch (e) {
      console.warn('Failed to select default toolbox category', e);
    }

    // ブロック配置完了後、スクロール位置を (0, 0) に設定
    try {
      requestAnimationFrame(() => {
        try {
          Blockly.svgResize(ws);
          const pair: any = (ws as any).scrollbar;
          if (pair?.set) {
            pair.set(0, 0);
          }
        } catch (err) {
          console.warn('Failed to set initial scroll position', err);
        }
      });
    } catch (e) {
      console.warn('Failed to schedule initial scroll position', e);
    }
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    if (!workspace) return;

    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      const { blockType, value } = data;

      if (blockType === 'sql_table' || blockType === 'sql_column') {
        const newBlock = workspace.newBlock(blockType);
        const fieldName = blockType === 'sql_table' ? 'TABLE_NAME' : 'COLUMN_NAME';
        newBlock.setFieldValue(value, fieldName);
        
        // 画面座標 (clientX/Y) -> ワークスペース座標に変換して配置
        const screen = new Blockly.utils.Coordinate(e.clientX, e.clientY);
        const wsXY = Blockly.utils.svgMath.screenToWsCoordinates(workspace, screen);

        newBlock.initSvg();
        newBlock.render();
        newBlock.moveTo(wsXY);

        // ドロップ後に現在選択されているカテゴリを再選択してブロックリストを表示
        setTimeout(() => {
          try {
            const toolboxApi: any = (workspace as any).getToolbox?.();
            if (toolboxApi) {
              const items: any[] = toolboxApi.getToolboxItems?.() ?? [];
              const target = (selectedCategoryName
                ? items.find((it: any) => it?.getName?.() === selectedCategoryName)
                : null) ?? items[0];
              if (target && toolboxApi.setSelectedItem) toolboxApi.setSelectedItem(target);
            }
          } catch (err) {
            console.warn('Failed to restore category selection after drop', err);
          }
        }, 10);
      }
    } catch (err) {
      console.error("Failed to handle drop", err);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-slate-200">{t.blocklyEditorLabel}</label>
      <div 
        style={{ height: '400px', width: '100%' }} 
        className={`relative rounded-md border border-slate-700 bg-slate-900 p-3 ${onRun || onSave ? 'pt-12' : ''}`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {(onRun || onSave) && (
          <div className="pointer-events-none absolute right-3 top-3 z-10 flex items-center gap-2">
            {onRun && (
              <button
                onClick={onRun}
                className="pointer-events-auto rounded-md bg-brand-500 px-12 py-1.5 text-white shadow-lg shadow-brand-500/30 hover:bg-brand-400 hover:shadow-brand-400/40 transition text-sm"
              >
                {runLabel ?? t.run}
              </button>
            )}
            {onSave && (
              <button
                onClick={onSave}
                className="pointer-events-auto rounded-md border border-slate-700 bg-slate-800 px-3 py-1.5 text-slate-100 hover:bg-slate-700 text-sm"
              >
                {saveLabel ?? t.save}
              </button>
            )}
          </div>
        )}
        <BlocklyWorkspace
          toolboxConfiguration={toolbox}
          initialXml={initialXml ?? initialXmlDefault}
          className="h-full w-full"
          workspaceConfiguration={workspaceConfiguration}
          onWorkspaceChange={workspaceDidChange}
          onInject={handleWorkspaceInjected}
        />
      </div>
      {/* 生成されたSQLを表示するエリア（デバッグ用） */}
      <label className="text-sm font-medium text-slate-200">{t.queryDisplayLabel}</label>
      <textarea
        value={sql}
        readOnly
        rows={5}
        className="w-full rounded-md border border-slate-700 bg-slate-800 p-3 font-mono text-sm text-slate-100"
      />
    </div>
  );
}

// デフォルトの空XML
const initialXmlDefault = `
<xml xmlns="https://developers.google.com/blockly/xml"></xml>
`;

// 簡易SQLパーサ：SELECT ... FROM ... [WHERE ...] [GROUP BY ...] [ORDER BY ...] [LIMIT ...]
function tryBuildWorkspaceFromSql(ws: Blockly.WorkspaceSvg, sqlText: string) {
  try {
    const text = sqlText.replace(/\s+/g, ' ').trim();
    const m = /^select\s+(distinct\s+)?(.+?)\s+from\s+([^\s]+)(?:\s+where\s+(.+?))?(?:\s+group\s+by\s+(.+?))?(?:\s+order\s+by\s+(.+?))?(?:\s+limit\s+(\d+))?$/i.exec(text);
    if (!m) return;

    const [, distinctPart, columnsPart, tablePart, wherePart, groupByPart, orderByPart, limitPart] = m;

    const origin = new Blockly.utils.Coordinate(40, 40);
    const selectBlock = ws.newBlock('sql_select');
    selectBlock.initSvg();
    selectBlock.render();
    selectBlock.moveTo(origin);

    // DISTINCT
    if (distinctPart) {
      try { (selectBlock as any).setFieldValue(true, 'DISTINCT'); } catch {}
    }

    // TABLE
    const tableBlock = ws.newBlock('sql_table');
    tableBlock.setFieldValue(safeIdent(tablePart), 'TABLE_NAME');
    tableBlock.initSvg();
    tableBlock.render();
    connectValue(selectBlock, 'TABLE', tableBlock);

    // COLUMNS
    const cols = columnsPart.split(',').map((s) => s.trim());
    if (cols.length === 1 && cols[0] === '*') {
      const star = ws.newBlock('sql_star');
      star.initSvg(); star.render();
      connectValue(selectBlock, 'COLUMNS', star);
    } else if (cols.length === 1) {
      connectValue(selectBlock, 'COLUMNS', makeColumn(ws, cols[0]));
    } else {
      // 2個までサポート（カスタムブロック仕様に合わせる）
      const list = ws.newBlock('sql_column_list');
      list.initSvg(); list.render();
      connectValueRaw(list, 'COLUMN1', makeColumn(ws, cols[0]));
      if (cols[1]) connectValueRaw(list, 'COLUMN2', makeColumn(ws, cols[1]));
      connectValue(selectBlock, 'COLUMNS', list);
    }

    let tail: Blockly.Block | null = selectBlock;

    // WHERE（単純な A OP B のみ対応）
    if (wherePart) {
      const where = wherePart.trim();
      const cm = /^(\S+)\s*(=|!=|>=|<=|>|<)\s*(.+)$/.exec(where);
      if (cm) {
        const [, left, op, right] = cm;
        const cmp = ws.newBlock('sql_compare');
        cmp.setFieldValue(op, 'OP');
        cmp.initSvg(); cmp.render();
        connectValueRaw(cmp, 'A', makeExpr(ws, left));
        connectValueRaw(cmp, 'B', makeExpr(ws, right));
        connectValue(selectBlock, 'WHERE', cmp);
      }
    }

    // GROUP BY（最初の1要素のみ）
    if (groupByPart) {
      const gcols = groupByPart.split(',').map((s) => s.trim());
      const gb = ws.newBlock('sql_groupby');
      gb.initSvg(); gb.render();
      connectValueRaw(gb, 'GROUP_BY_VALUE', makeColumn(ws, gcols[0]));
      tail = connectNext(tail, gb);
    }

    // ORDER BY（形式: col [ASC|DESC]）
    if (orderByPart) {
      const om = /^(\S+)(?:\s+(ASC|DESC))?$/i.exec(orderByPart.trim());
      const dir = (om?.[2] || 'ASC').toUpperCase();
      const obDir = ws.newBlock('sql_order_by_direction');
      obDir.setFieldValue(dir, 'DIRECTION');
      obDir.initSvg(); obDir.render();
      connectValueRaw(obDir, 'COLUMN', makeColumn(ws, om?.[1] || ''));

      const ob = ws.newBlock('sql_orderby');
      ob.initSvg(); ob.render();
      connectValueRaw(ob, 'ORDER_BY_VALUE', obDir);
      tail = connectNext(tail, ob);
    }

    // LIMIT
    if (limitPart) {
      const lb = ws.newBlock('sql_limit');
      lb.initSvg(); lb.render();
      // LIMIT の入力は Number チェックだが、ここでは text モックとして扱う
      const num = ws.newBlock('math_number');
      (num as any).setFieldValue(String(parseInt(limitPart, 10) || 10), 'NUM');
      num.initSvg(); num.render();
      connectValueRaw(lb, 'LIMIT', num);
      tail = connectNext(tail, lb);
    }

    // レイアウト軽い整列
    try { Blockly.svgResize(ws); } catch {}
  } catch (e) {
    // noop
  }
}

function makeColumn(ws: Blockly.WorkspaceSvg, name: string): Blockly.Block {
  const block = ws.newBlock('sql_column');
  block.setFieldValue(safeIdent(name), 'COLUMN_NAME');
  block.initSvg(); block.render();
  return block;
}

function makeExpr(ws: Blockly.WorkspaceSvg, token: string): Blockly.Block {
  const trimmed = token.trim();
  // 数値
  if (/^[-+]?\d+(?:\.\d+)?$/.test(trimmed)) {
    const num = ws.newBlock('math_number');
    (num as any).setFieldValue(trimmed, 'NUM');
    num.initSvg(); num.render();
    return num;
  }
  // 文字列リテラル（'..."... いずれか）
  if ((trimmed.startsWith("'") && trimmed.endsWith("'")) || (trimmed.startsWith('"') && trimmed.endsWith('"'))) {
    const txt = ws.newBlock('text');
    (txt as any).setFieldValue(trimmed.slice(1, -1), 'TEXT');
    txt.initSvg(); txt.render();
    return txt;
  }
  // 列名
  return makeColumn(ws, trimmed);
}

function safeIdent(v: string): string {
  return String(v || '').replace(/^[`\"']|[`\"']$/g, '').trim();
}

function connectValue(target: Blockly.Block, inputName: string, child: Blockly.Block) {
  const input = target.getInput(inputName);
  input?.connection?.connect(child.outputConnection as any);
}

function connectValueRaw(parent: Blockly.Block, inputName: string, child: Blockly.Block) {
  parent.getInput(inputName)?.connection?.connect((child.outputConnection as any));
}

function connectNext(tail: Blockly.Block | null, nextBlock: Blockly.Block): Blockly.Block {
  if (tail && (tail as any).nextConnection) {
    (tail as any).nextConnection.connect((nextBlock as any).previousConnection);
  }
  return nextBlock;
}



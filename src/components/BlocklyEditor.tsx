"use client";

import { useState } from 'react';
import { BlocklyWorkspace } from 'react-blockly';
import * as Blockly from 'blockly/core';
import {javascriptGenerator} from 'blockly/javascript';

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
                "options": [ ["MIN", "MIN"], ["MAX", "MAX"] ]
            },
            { "type": "input_value", "name": "COLUMN" }
        ],
        "output": "String",
        "colour": 160,
        "tooltip": "Aggregate functions"
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
    }
]);

// カスタムブロックのSQLジェネレーター
javascriptGenerator.forBlock['sql_select'] = function(block: Blockly.Block) {
    const distinct = block.getFieldValue('DISTINCT') === 'TRUE' ? 'DISTINCT ' : '';
    const columns = javascriptGenerator.valueToCode(block, 'COLUMNS', javascriptGenerator.ORDER_ATOMIC) || '*';
    const table = javascriptGenerator.valueToCode(block, 'TABLE', javascriptGenerator.ORDER_ATOMIC) || 'your_table';
    const where = javascriptGenerator.valueToCode(block, 'WHERE', javascriptGenerator.ORDER_ATOMIC);
    
    let code = `SELECT ${distinct}${columns} FROM ${table}`;
    if (where) {
        code += ` WHERE ${where}`;
    }
    return code;
};

javascriptGenerator.forBlock['sql_table'] = function(block: Blockly.Block) {
    const tableName = block.getFieldValue('TABLE_NAME');
    return [tableName, javascriptGenerator.ORDER_ATOMIC];
};

javascriptGenerator.forBlock['sql_column'] = function(block: Blockly.Block) {
    const columnName = block.getFieldValue('COLUMN_NAME');
    return [columnName, javascriptGenerator.ORDER_ATOMIC];
};

javascriptGenerator.forBlock['sql_compare'] = function(block: Blockly.Block) {
    const operator = block.getFieldValue('OP');
    const argument0 = javascriptGenerator.valueToCode(block, 'A', javascriptGenerator.ORDER_ATOMIC) || 'NULL';
    const argument1 = javascriptGenerator.valueToCode(block, 'B', javascriptGenerator.ORDER_ATOMIC) || 'NULL';
    const code = `${argument0} ${operator} ${argument1}`;
    return [code, javascriptGenerator.ORDER_RELATIONAL];
};

javascriptGenerator.forBlock['sql_logic_operator'] = function(block: Blockly.Block) {
    const operator = block.getFieldValue('OP');
    const order = (operator === 'AND') ? javascriptGenerator.ORDER_LOGICAL_AND : javascriptGenerator.ORDER_LOGICAL_OR;
    const argument0 = javascriptGenerator.valueToCode(block, 'A', order) || 'FALSE';
    const argument1 = javascriptGenerator.valueToCode(block, 'B', order) || 'FALSE';
    const code = `${argument0} ${operator} ${argument1}`;
    return [code, order];
};

javascriptGenerator.forBlock['sql_star'] = function(block: Blockly.Block) {
    return ['*', javascriptGenerator.ORDER_ATOMIC];
};

javascriptGenerator.forBlock['sql_aggregate_function'] = function(block: Blockly.Block) {
    const aggregate = block.getFieldValue('AGGREGATE');
    const column = javascriptGenerator.valueToCode(block, 'COLUMN', javascriptGenerator.ORDER_ATOMIC) || 'column';
    const code = `${aggregate}(${column})`;
    return [code, javascriptGenerator.ORDER_FUNCTION_CALL];
};

javascriptGenerator.forBlock['sql_order_by_direction'] = function(block: Blockly.Block) {
    const column = javascriptGenerator.valueToCode(block, 'COLUMN', javascriptGenerator.ORDER_ATOMIC) || 'column';
    const direction = block.getFieldValue('DIRECTION');
    const code = `${column} ${direction}`;
    return [code, javascriptGenerator.ORDER_ATOMIC];
};

javascriptGenerator.forBlock['sql_orderby'] = function(block: Blockly.Block) {
    const value = javascriptGenerator.valueToCode(block, 'ORDER_BY_VALUE', javascriptGenerator.ORDER_ATOMIC) || 'column';
    return ` ORDER BY ${value}`;
};

javascriptGenerator.forBlock['sql_limit'] = function(block: Blockly.Block) {
    const limit = javascriptGenerator.valueToCode(block, 'LIMIT', javascriptGenerator.ORDER_ATOMIC) || '10';
    return ` LIMIT ${limit}`;
};


// SQL用のカスタムツールボックスを定義
const toolbox = {
  kind: 'flyoutToolbox',
  contents: [
    {
      kind: 'block',
      type: 'sql_select'
    },
    {
      kind: 'block',
      type: 'sql_table'
    },
    {
      kind: 'block',
      type: 'sql_column'
    },
    {
      kind: 'block',
      type: 'sql_compare'
    },
    {
      kind: 'block',
      type: 'sql_logic_operator'
    },
    {
        kind: 'block',
        type: 'sql_star'
    },
    {
        kind: 'block',
        type: 'sql_aggregate_function'
    },
    {
        kind: 'block',
        type: 'sql_order_by_direction'
    },
    {
        kind: 'block',
        type: 'sql_orderby'
    },
    {
        kind: 'block',
        type: 'sql_limit'
    },
    {
      kind: 'block',
      type: 'text'
    },
    {
      kind: 'block',
      type: 'math_number'
    }
  ]
};

const initialXml = `
<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="sql_select" x="10" y="10"></block>
</xml>
`;

type Props = {
  value: string;
  onChange: (v: string) => void;
};

export function BlocklyEditor({ onChange }: Props) {
  const [sql, setSql] = useState('');
  const [workspace, setWorkspace] = useState<Blockly.WorkspaceSvg | null>(null);

  function workspaceDidChange(workspace: Blockly.WorkspaceSvg) {
    if (!workspace) return;
    try {
        const code = javascriptGenerator.workspaceToCode(workspace);
        setSql(code);
        onChange(code);
    } catch (e) {
        console.error(e);
    }
  }

  function handleWorkspaceInjected(ws: Blockly.WorkspaceSvg) {
    setWorkspace(ws);
    // 初期ロード時にもコード生成を実行する
    const code = javascriptGenerator.workspaceToCode(ws);
    setSql(code);
    onChange(code);
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
        
        // 座標計算
        const workspaceRect = (workspace as any).svgGroup_.getBoundingClientRect();
        const dropX = e.clientX - workspaceRect.left;
        const dropY = e.clientY - workspaceRect.top;
        
        newBlock.moveBy(dropX, dropY);
        newBlock.initSvg();
        newBlock.render();
      }
    } catch (err) {
      console.error("Failed to handle drop", err);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-slate-200">SQLブロックエディタ</label>
      <div 
        style={{ height: '400px', width: '100%' }} 
        className="rounded-md border border-slate-700 bg-slate-900 p-3"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <BlocklyWorkspace
          toolboxConfiguration={toolbox}
          initialXml={initialXml}
          className="h-full w-full"
          workspaceConfiguration={{
            grid: {
              spacing: 20,
              length: 3,
              colour: '#4a5568',
              snap: true,
            },
            theme: Blockly.Themes.Dark
          }}
          onWorkspaceChange={workspaceDidChange}
          onInject={handleWorkspaceInjected}
        />
      </div>
      {/* 生成されたSQLを表示するエリア（デバッグ用） */}
      <label className="text-sm font-medium text-slate-200">実行するクエリ文</label>
      <textarea
        value={sql}
        readOnly
        rows={5}
        className="w-full rounded-md border border-slate-700 bg-slate-800 p-3 font-mono text-sm text-slate-100"
      />
    </div>
  );
}



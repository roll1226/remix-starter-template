-- Todosテーブルを作成
DROP TABLE IF EXISTS Todos;
CREATE TABLE IF NOT EXISTS Todos (
    TodoId INTEGER PRIMARY KEY AUTOINCREMENT,
    Title TEXT NOT NULL,
    IsComplete INTEGER DEFAULT 0,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- サンプルデータを挿入
INSERT INTO Todos (Title, IsComplete) VALUES
('Remixアプリケーションの開発', 0),
('D1データベースとの連携', 1),
('フロントエンドの実装', 0),
('テストの作成', 0);

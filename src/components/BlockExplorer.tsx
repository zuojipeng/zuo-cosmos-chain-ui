import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface BlockInfo {
  block_id: {
    hash: string;
  };
  block: {
    header: {
      height: string;
      time: string;
      proposer_address: string;
    };
    data: {
      txs: string[];
    };
    last_commit: {
      signatures: Array<{
        validator_address: string;
      }>;
    };
  };
}

interface StatusInfo {
  sync_info: {
    latest_block_height: string;
  };
}

const BlockExplorer: React.FC = () => {
  const [currentHeight, setCurrentHeight] = useState<string>('');
  const [queryHeight, setQueryHeight] = useState<string>('');
  const [blockInfo, setBlockInfo] = useState<BlockInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 获取最新区块高度
  const fetchLatestHeight = async () => {
    try {
      const response = await axios.get<StatusInfo>('/status');
      setCurrentHeight(response.data.sync_info.latest_block_height);
    } catch (err) {
      // console.error('获取最新区块高度失败:', err);
      // setError('获取最新区块高度失败');
    }
  };

  // 获取区块信息
  const fetchBlockInfo = async (height?: string) => {
    setLoading(true);
    setError('');

    try {
      const url = height
        ? `/block?height=${height}`
        : '/block';

      const response = await axios.get<{ result: BlockInfo }>(url);
      setBlockInfo(response.data.result);
    } catch (err) {
      setError(`获取区块信息失败: ${err instanceof Error ? err.message : '未知错误'}`);
      console.error('获取区块信息失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 查询指定区块
  const queryBlock = () => {
    const height = queryHeight.trim();
    if (height) {
      const heightNum = parseInt(height);
      if (isNaN(heightNum) || heightNum <= 0) {
        setError('请输入有效的区块高度（正整数）');
        return;
      }
      fetchBlockInfo(height);
    } else {
      setError('请输入区块高度');
    }
  };

  // 格式化时间
  const formatTime = (timeStr: string) => {
    try {
      return new Date(timeStr).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return timeStr;
    }
  };

  // 格式化地址
  const formatAddress = (address: string) => {
    if (!address) return 'N/A';
    return `${address.substring(0, 12)}...${address.substring(address.length - 12)}`;
  };

  // 页面加载时获取最新区块高度
  useEffect(() => {
    fetchLatestHeight();

    // 每5秒刷新一次最新区块高度
    const interval = setInterval(fetchLatestHeight, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={styles.container}>
      <h2>区块浏览器</h2>

      {/* 最新区块高度 */}
      <div style={styles.latestHeight}>
        <strong>最新区块高度:</strong> {currentHeight || '加载中...'}
        <span style={styles.refreshTip}>（每5秒自动刷新）</span>
      </div>

      {/* 区块查询 */}
      <div style={styles.querySection}>
        <h3>查询区块</h3>
        <div style={styles.queryForm}>
          <input
            type="number"
            value={queryHeight}
            onChange={(e) => setQueryHeight(e.target.value)}
            placeholder="输入区块高度"
            style={styles.input}
            min="1"
          />
          <button
            onClick={() => fetchBlockInfo()} // 获取最新区块
            style={styles.button}
          >
            最新区块
          </button>
          <button
            onClick={queryBlock}
            disabled={loading}
            style={styles.button}
          >
            {loading ? '查询中...' : '查询指定区块'}
          </button>
        </div>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {/* 区块信息展示 */}
      {blockInfo && (
        <div style={styles.blockInfo}>
          <h3>区块详情</h3>

          <div style={styles.infoRow}>
            <span style={styles.label}>区块高度:</span>
            <span style={styles.value}>{blockInfo.block.header.height}</span>
          </div>

          <div style={styles.infoRow}>
            <span style={styles.label}>区块哈希:</span>
            <span style={styles.value} title={blockInfo.block_id.hash}>
              {formatAddress(blockInfo.block_id.hash)}
            </span>
          </div>

          <div style={styles.infoRow}>
            <span style={styles.label}>打包时间:</span>
            <span style={styles.value}>{formatTime(blockInfo.block.header.time)}</span>
          </div>

          <div style={styles.infoRow}>
            <span style={styles.label}>交易数量:</span>
            <span style={styles.value}>
              {blockInfo.block.data.txs ? blockInfo.block.data.txs.length : 0}
            </span>
          </div>

          <div style={styles.infoRow}>
            <span style={styles.label}>矿工地址:</span>
            <span style={styles.value} title={blockInfo.block.header.proposer_address}>
              {formatAddress(blockInfo.block.header.proposer_address)}
            </span>
          </div>

          <div style={styles.infoRow}>
            <span style={styles.label}>验证者数量:</span>
            <span style={styles.value}>
              {blockInfo.block.last_commit.signatures.length}
            </span>
          </div>

          {/* 交易列表 */}
          {blockInfo.block.data.txs && blockInfo.block.data.txs.length > 0 && (
            <div style={styles.txsSection}>
              <h4>交易列表</h4>
              {blockInfo.block.data.txs.map((tx, index) => (
                <div key={index} style={styles.txItem}>
                  <strong>交易 #{index + 1}:</strong>
                  <div style={styles.txHash} title={tx}>
                    {formatAddress(tx)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '20px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    marginBottom: '20px',
    backgroundColor: '#f9f9f9',
  },
  latestHeight: {
    marginBottom: '20px',
    padding: '15px',
    backgroundColor: '#e8f5e8',
    border: '1px solid #4CAF50',
    borderRadius: '6px',
    fontSize: '16px',
  },
  refreshTip: {
    fontSize: '12px',
    color: '#666',
    marginLeft: '10px',
  },
  querySection: {
    marginBottom: '20px',
    padding: '15px',
    border: '1px solid #eee',
    borderRadius: '6px',
    backgroundColor: 'white',
  },
  queryForm: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  input: {
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    minWidth: '150px',
  },
  button: {
    padding: '8px 16px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  error: {
    marginTop: '15px',
    padding: '10px',
    backgroundColor: '#ffebee',
    border: '1px solid #f44336',
    borderRadius: '4px',
    color: '#d32f2f',
  },
  blockInfo: {
    padding: '20px',
    border: '1px solid #e1e5e9',
    borderRadius: '8px',
    backgroundColor: 'white',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid #eee',
  },
  label: {
    fontWeight: 'bold',
    color: '#333',
    minWidth: '120px',
  },
  value: {
    fontFamily: 'monospace',
    fontSize: '12px',
    wordBreak: 'break-all',
    flex: 1,
    textAlign: 'right',
  },
  txsSection: {
    marginTop: '20px',
    padding: '15px',
    backgroundColor: '#f8f9fa',
    borderRadius: '6px',
  },
  txItem: {
    marginBottom: '10px',
    padding: '10px',
    backgroundColor: 'white',
    border: '1px solid #ddd',
    borderRadius: '4px',
  },
  txHash: {
    fontFamily: 'monospace',
    fontSize: '11px',
    wordBreak: 'break-all',
    marginTop: '5px',
    color: '#666',
  },
};

export default BlockExplorer;
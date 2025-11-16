import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Validator {
  address: string;
  pub_key: {
    type: string;
    value: string;
  };
  voting_power: string;
  proposer_priority: string;
}

interface ValidatorSetResponse {
  result: {
    validators: Validator[];
    count: string;
    total: string;
    block_height: string;
  };
}

const ValidatorInfo: React.FC = () => {
  const [validators, setValidators] = useState<Validator[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 获取验证者信息
  const fetchValidators = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.get<ValidatorSetResponse>('/validators');

      console.log('获取验证者信息响应:', response.data);
      setValidators(response.data.result.validators);
    } catch (err) {
      setError(`获取验证者信息失败: ${err instanceof Error ? err.message : '未知错误'}`);
      console.error('获取验证者信息失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 格式化地址
  const formatAddress = (address: string) => {
    if (!address) return 'N/A';
    return `${address.substring(0, 16)}...${address.substring(address.length - 16)}`;
  };

  // 获取验证者状态 - 基于 voting_power 判断
  const getValidatorStatus = (votingPower: string) => {
    const power = parseInt(votingPower) || 0;
    if (power > 0) {
      return { text: '活跃', color: '#4CAF50' };
    } else {
      return { text: '未激活', color: '#9E9E9E' };
    }
  };

  // 计算累计奖励（简化为：算力 × 0.01 stake）
  const calculateRewards = (votingPower: string) => {
    const power = parseInt(votingPower) || 0;
    return (power * 0.01).toFixed(6);
  };

  // 格式化数字
  const formatNumber = (num: string | number) => {
    const number = typeof num === 'string' ? parseInt(num) || 0 : num;
    return number.toLocaleString();
  };

  // 页面加载时获取验证者信息
  useEffect(() => {
    fetchValidators();
  }, []);

  return (
    <div style={styles.container}>
      <h2>矿工信息</h2>

      <div style={styles.header}>
        <div style={styles.info}>
          <strong>验证节点总数:</strong> {validators.length}
        </div>
        <button
          onClick={fetchValidators}
          disabled={loading}
          style={styles.refreshButton}
        >
          {loading ? '刷新中...' : '刷新数据'}
        </button>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {/* 验证者列表 */}
      <div style={styles.validatorsList}>
        {validators.length === 0 && !loading && !error && (
          <div style={styles.noData}>暂无验证者数据</div>
        )}

        {validators.map((validator, index) => {
          const statusInfo = getValidatorStatus(validator.voting_power);
          const rewards = calculateRewards(validator.voting_power);

          return (
            <div key={index} style={styles.validatorCard}>
              {/* 验证者标题 */}
              <div style={styles.validatorHeader}>
                <h3 style={styles.validatorTitle}>
                  验证节点 #{index + 1}
                  {index === 0 && <span style={styles.proposerTag}>主矿工</span>}
                </h3>
                <div
                  style={{
                    ...styles.status,
                    backgroundColor: statusInfo.color,
                  }}
                >
                  {statusInfo.text}
                </div>
              </div>

              {/* 验证者信息 */}
              <div style={styles.validatorInfo}>
                <div style={styles.infoRow}>
                  <span style={styles.label}>矿工地址:</span>
                  <span
                    style={styles.value}
                    title={validator.address}
                  >
                    {formatAddress(validator.address)}
                  </span>
                </div>

                <div style={styles.infoRow}>
                  <span style={styles.label}>算力 (Voting Power):</span>
                  <span style={styles.value}>
                    {formatNumber(validator.voting_power)}
                  </span>
                </div>

                <div style={styles.infoRow}>
                  <span style={styles.label}>累计奖励:</span>
                  <span style={styles.value}>
                    {rewards} stake
                  </span>
                </div>

                <div style={styles.infoRow}>
                  <span style={styles.label}>提议优先级:</span>
                  <span style={styles.value}>
                    {validator.proposer_priority || 'N/A'}
                  </span>
                </div>

                <div style={styles.infoRow}>
                  <span style={styles.label}>公钥类型:</span>
                  <span style={styles.value}>
                    {validator.pub_key.type || 'N/A'}
                  </span>
                </div>
              </div>

              {/* 挖矿状态指示器 */}
              <div style={styles.miningStatus}>
                <div
                  style={{
                    ...styles.statusDot,
                    backgroundColor: statusInfo.color,
                  }}
                />
                <span style={styles.statusText}>
                  {statusInfo.text === '活跃' ? '挖矿中' : '未挖矿'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 说明信息 */}
      <div style={styles.notice}>
        <h4>说明：</h4>
        <ul style={styles.noticeList}>
          <li><strong>算力 (Voting Power):</strong> 验证者的投票权重，决定了出块概率</li>
          <li><strong>累计奖励:</strong> 简化计算为算力 × 0.01 stake（实际奖励根据网络协议动态计算）</li>
          <li><strong>挖矿状态:</strong> 活跃状态的验证者正在参与区块生产和共识</li>
          <li><strong>主矿工:</strong> 当前区块的主要提议者</li>
        </ul>
      </div>
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
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    padding: '15px',
    backgroundColor: '#e3f2fd',
    border: '1px solid #bbdefb',
    borderRadius: '6px',
  },
  info: {
    fontSize: '16px',
    color: '#1976d2',
  },
  refreshButton: {
    padding: '8px 16px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  error: {
    marginBottom: '20px',
    padding: '10px',
    backgroundColor: '#ffebee',
    border: '1px solid #f44336',
    borderRadius: '4px',
    color: '#d32f2f',
  },
  validatorsList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
    gap: '20px',
  },
  noData: {
    textAlign: 'center',
    padding: '40px',
    color: '#666',
    fontSize: '16px',
  },
  validatorCard: {
    padding: '20px',
    border: '1px solid #e1e5e9',
    borderRadius: '8px',
    backgroundColor: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  validatorHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
    borderBottom: '1px solid #eee',
    paddingBottom: '10px',
  },
  validatorTitle: {
    margin: 0,
    fontSize: '16px',
    color: '#333',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  proposerTag: {
    backgroundColor: '#ff6b35',
    color: 'white',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '10px',
    fontWeight: 'normal',
  },
  status: {
    color: 'white',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  validatorInfo: {
    marginBottom: '15px',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid #f5f5f5',
  },
  label: {
    fontWeight: 'bold',
    color: '#555',
    fontSize: '13px',
    minWidth: '120px',
  },
  value: {
    fontFamily: 'monospace',
    fontSize: '12px',
    wordBreak: 'break-all',
    flex: 1,
    textAlign: 'right',
    color: '#333',
  },
  miningStatus: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    paddingTop: '10px',
    borderTop: '1px solid #eee',
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  statusText: {
    fontSize: '13px',
    color: '#666',
  },
  notice: {
    marginTop: '30px',
    padding: '15px',
    backgroundColor: '#f8f9fa',
    border: '1px solid #dee2e6',
    borderRadius: '6px',
  },
  noticeList: {
    margin: '10px 0 0 20px',
    paddingLeft: '0',
  },
  noticeListItem: {
    marginBottom: '5px',
    fontSize: '13px',
    color: '#666',
  },
};

export default ValidatorInfo;
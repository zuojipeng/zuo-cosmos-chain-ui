import React, { useState } from 'react';
import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing';

interface WalletInfo {
  address: string;
  mnemonic: string;
}

const WalletConnect: React.FC<{ onWalletConnect: (wallet: WalletInfo) => void }> = ({ onWalletConnect }) => {
  const [mnemonic, setMnemonic] = useState('');
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [importMnemonic, setImportMnemonic] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 创建新钱包
  const createWallet = async () => {
    setLoading(true);
    setError('');

    try {
      // 使用 DirectSecp256k1HdWallet 生成新钱包，前缀为 cosmos
      const wallet = await DirectSecp256k1HdWallet.generate(12, {
        prefix: 'cosmos',
      });

      const accounts = await wallet.getAccounts();
      const address = accounts[0].address;

      // 获取助记词
      const generatedMnemonic = wallet.mnemonic;

      setMnemonic(generatedMnemonic);
      setWalletInfo({ address, mnemonic: generatedMnemonic });
      onWalletConnect({ address, mnemonic: generatedMnemonic });
    } catch (err) {
      setError('创建钱包失败，请重试');
      console.error('创建钱包错误:', err);
    } finally {
      setLoading(false);
    }
  };

  // 导入已有钱包
  const importWallet = async () => {
    if (!importMnemonic.trim()) {
      setError('请输入助记词');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(importMnemonic.trim(), {
        prefix: 'cosmos',
      });

      const accounts = await wallet.getAccounts();
      const address = accounts[0].address;

      const walletData = { address, mnemonic: importMnemonic.trim() };
      setWalletInfo(walletData);
      setMnemonic(importMnemonic.trim());
      onWalletConnect(walletData);
    } catch (err) {
      setError('导入钱包失败，请检查助记词是否正确');
      console.error('导入钱包错误:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>钱包管理</h2>

      {!walletInfo ? (
        <div>
          <div style={styles.section}>
            <h3>创建新钱包</h3>
            <button
              onClick={createWallet}
              disabled={loading}
              style={styles.button}
            >
              {loading ? '创建中...' : '创建新钱包'}
            </button>
          </div>

          <div style={styles.section}>
            <h3>导入已有钱包</h3>
            <textarea
              value={importMnemonic}
              onChange={(e) => setImportMnemonic(e.target.value)}
              placeholder="请输入12词助记词，用空格分隔"
              style={styles.textarea}
              rows={3}
            />
            <button
              onClick={importWallet}
              disabled={loading}
              style={styles.button}
            >
              {loading ? '导入中...' : '导入钱包'}
            </button>
          </div>

          {error && <div style={styles.error}>{error}</div>}
        </div>
      ) : (
        <div style={styles.walletInfo}>
          <h3>钱包信息</h3>
          <div style={styles.infoItem}>
            <strong>地址:</strong>
            <div style={styles.address}>{walletInfo.address}</div>
          </div>
          <div style={styles.infoItem}>
            <strong>助记词:</strong>
            <div style={styles.mnemonic}>{mnemonic}</div>
          </div>
          <div style={styles.warning}>
            ⚠️ 请安全保存您的助记词，丢失助记词将无法恢复钱包！
          </div>
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
  section: {
    marginBottom: '20px',
    padding: '15px',
    border: '1px solid #eee',
    borderRadius: '6px',
    backgroundColor: 'white',
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  textarea: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    marginBottom: '10px',
    resize: 'vertical',
  },
  error: {
    color: 'red',
    marginTop: '10px',
    padding: '10px',
    backgroundColor: '#ffebee',
    border: '1px solid #f44336',
    borderRadius: '4px',
  },
  walletInfo: {
    padding: '15px',
    border: '1px solid #4CAF50',
    borderRadius: '6px',
    backgroundColor: '#e8f5e8',
  },
  infoItem: {
    marginBottom: '15px',
  },
  address: {
    padding: '10px',
    backgroundColor: 'white',
    border: '1px solid #ddd',
    borderRadius: '4px',
    wordBreak: 'break-all',
    fontFamily: 'monospace',
    fontSize: '12px',
  },
  mnemonic: {
    padding: '10px',
    backgroundColor: 'white',
    border: '1px solid #ddd',
    borderRadius: '4px',
    wordBreak: 'break-word',
    fontFamily: 'monospace',
    fontSize: '12px',
    lineHeight: '1.4',
  },
  warning: {
    marginTop: '15px',
    padding: '10px',
    backgroundColor: '#fff3cd',
    border: '1px solid #ffeaa7',
    borderRadius: '4px',
    color: '#856404',
  },
};

export default WalletConnect;
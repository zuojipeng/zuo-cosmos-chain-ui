import React, { useState, useEffect } from 'react';
import axios from 'axios';
import WalletConnect from './components/WalletConnect';
import TokenTransfer from './components/TokenTransfer';
import BlockExplorer from './components/BlockExplorer';
import ValidatorInfo from './components/ValidatorInfo';
import './App.css';

interface WalletInfo {
  address: string;
  mnemonic: string;
}

const App: React.FC = () => {
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [latestBlockHeight, setLatestBlockHeight] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<string>(new Date().toLocaleString());

  // 获取最新区块高度
  const fetchLatestBlockHeight = async () => {
    try {
      const response = await axios.get('/status', {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        timeout: 5000,
      });
      const blockHeight = response.data?.result?.sync_info?.latest_block_height;
      if (blockHeight) {
        setLatestBlockHeight(blockHeight);
      }
    } catch (error) {
      // 静默处理错误，避免频繁的错误提示干扰用户体验
      console.error('获取最新区块高度失败:', error);
      // 不设置错误状态，保持当前的区块高度显示
    }
  };

  // 更新当前时间
  const updateTime = () => {
    setCurrentTime(new Date().toLocaleString('zh-CN'));
  };

  // 钱包连接处理
  const handleWalletConnect = (walletInfo: WalletInfo) => {
    setWallet(walletInfo);
  };

  // 钱包断开连接
  const handleWalletDisconnect = () => {
    setWallet(null);
  };

  // 页面加载时获取区块高度并设置定时器
  useEffect(() => {
    fetchLatestBlockHeight();
    updateTime();

    // 每5秒更新区块高度和时间
    const interval = setInterval(() => {
      fetchLatestBlockHeight();
      updateTime();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="App">
      {/* 导航栏 */}
      <nav style={styles.navbar}>
        <div style={styles.navContainer}>
          <div style={styles.navLeft}>
            <h1 style={styles.title}>Cosmos 本地链交互工具</h1>
            <div style={styles.chainInfo}>
              <span style={styles.chainId}>链 ID: onlyzuochain</span>
              <span style={styles.blockHeight}>区块高度: {latestBlockHeight || '加载中...'}</span>
            </div>
          </div>
          <div style={styles.navRight}>
            <div style={styles.currentTime}>{currentTime}</div>
            {wallet && (
              <button
                onClick={handleWalletDisconnect}
                style={styles.disconnectButton}
              >
                断开钱包
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* 主体内容 */}
      <main style={styles.main}>
        <div style={styles.container}>
          {/* 钱包状态提示 */}
          {wallet && (
            <div style={styles.walletStatus}>
              <span style={styles.walletStatusText}>
                ✅ 钱包已连接: {wallet.address.substring(0, 20)}...{wallet.address.substring(wallet.address.length - 10)}
              </span>
            </div>
          )}

          {/* 组件网格布局 */}
          <div style={styles.componentsGrid}>
            {/* 钱包管理组件 - 始终显示 */}
            <div style={styles.componentCard}>
              <WalletConnect onWalletConnect={handleWalletConnect} />
            </div>

            {/* 其他组件 - 需要连接钱包后显示 */}
            <div style={styles.componentCard}>
              <TokenTransfer wallet={wallet} />
            </div>

            <div style={styles.componentCard}>
              <BlockExplorer />
            </div>

            <div style={styles.componentCard}>
              <ValidatorInfo />
            </div>
          </div>
        </div>
      </main>

      {/* 页脚 */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <p>&copy; 2024 Cosmos 本地链交互工具 | 基于 React + Cosmos SDK</p>
          <div style={styles.footerLinks}>
            <span>RPC: http://localhost:26657</span>
            <span>代币: stake</span>
            <span>前缀: cosmos</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  navbar: {
    backgroundColor: '#2c3e50',
    color: 'white',
    padding: '15px 0',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
  },
  navContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navLeft: {
    flex: 1,
  },
  title: {
    margin: '0 0 5px 0',
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#ecf0f1',
  },
  chainInfo: {
    display: 'flex',
    gap: '20px',
    fontSize: '14px',
  },
  chainId: {
    backgroundColor: '#3498db',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
  },
  blockHeight: {
    backgroundColor: '#27ae60',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
  },
  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  currentTime: {
    fontSize: '14px',
    color: '#bdc3c7',
  },
  disconnectButton: {
    padding: '8px 16px',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  main: {
    minHeight: 'calc(100vh - 120px)',
    padding: '20px 0',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
  },
  walletStatus: {
    marginBottom: '20px',
    padding: '15px',
    backgroundColor: '#d4edda',
    border: '1px solid #c3e6cb',
    borderRadius: '6px',
    textAlign: 'center',
  },
  walletStatusText: {
    color: '#155724',
    fontSize: '14px',
    fontFamily: 'monospace',
  },
  componentsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '20px',
    marginTop: '20px',
  },
  componentCard: {
    // 组件内部的样式由各自的组件定义
  },
  footer: {
    backgroundColor: '#34495e',
    color: 'white',
    padding: '20px 0',
    textAlign: 'center',
  },
  footerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
  },
  footerLinks: {
    marginTop: '10px',
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    fontSize: '12px',
    color: '#bdc3c7',
  },
};

export default App;

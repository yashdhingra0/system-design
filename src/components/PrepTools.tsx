import React, { useState } from 'react';
import { Card3D } from './ui/Card3D';
import { Calculator, Clock, Database, Wifi, HardDrive, Info, ArrowRight } from 'lucide-react';

interface LatencyOp {
  name: string;
  ns: number;
  description: string;
}

const latencyNumbers: LatencyOp[] = [
  { name: "L1 Cache Reference", ns: 0.5, description: "Reading from CPU L1 Cache. Extremely fast, hardware-bound." },
  { name: "Branch Misprediction", ns: 5, description: "CPU guess failure in logic pathway pipeline." },
  { name: "L2 Cache Reference", ns: 7, description: "Reading from CPU L2 Cache. Faster than main RAM." },
  { name: "Mutex Lock/Unlock", ns: 25, description: "Standard OS synchronization operation." },
  { name: "Main Memory Reference", ns: 100, description: "Reading directly from RAM. Speed bottleneck for CPU cores." },
  { name: "Compress 1K Bytes (Zippy)", ns: 3000, description: "Software compression run locally in memory." },
  { name: "Send 1K Bytes over 1 Gbps Network", ns: 10000, description: "Transmission delay for small payloads over local ethernet." },
  { name: "Read 4K Randomly from SSD", ns: 150000, description: "Solid-state disk random access latency." },
  { name: "Read 1 MB Sequentially from Memory", ns: 250000, description: "High-speed sequential cache read directly from RAM." },
  { name: "Round Trip in Same Datacenter", ns: 500000, description: "Network round-trip latency within local server racks." },
  { name: "Read 1 MB Sequentially from SSD", ns: 1000000, description: "Sequential read from local solid state drive (1 ms)." },
  { name: "Disk Seek", ns: 10000000, description: "Physical HDD magnetic arm relocation latency (10 ms)." },
  { name: "Read 1 MB Sequentially from Disk", ns: 20000000, description: "Sequential read from physical spinning HDD platter (20 ms)." },
  { name: "Send Packet CA -> Netherlands -> CA", ns: 150000000, description: "Global WAN fiber optic trans-oceanic round trip (150 ms)." }
];

export const PrepTools: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'calculator' | 'latency'>('calculator');

  // Calculator states
  const [dau, setDau] = useState<number>(50000000); // 50M
  const [reqsPerUser, setReqsPerUser] = useState<number>(20);
  const [writeRatio, setWriteRatio] = useState<number>(10); // 10% writes
  const [readPayload, setReadPayload] = useState<number>(2); // 2 KB
  const [writePayload, setWritePayload] = useState<number>(1); // 1 KB
  const [retentionYears, setRetentionYears] = useState<number>(5);
  const [cacheRatio, setCacheRatio] = useState<number>(20); // 20% (Pareto 80/20 rule)

  // Latency comparison states
  const [opAIndex, setOpAIndex] = useState<number>(0); // L1 Cache
  const [opBIndex, setOpBIndex] = useState<number>(11); // Disk Seek

  // Storage and bandwidth formatter helper
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatBandwidth = (bytesPerSec: number): string => {
    const bitsPerSec = bytesPerSec * 8;
    if (bitsPerSec >= 1e9) {
      return (bitsPerSec / 1e9).toFixed(2) + ' Gbps';
    }
    if (bitsPerSec >= 1e6) {
      return (bitsPerSec / 1e6).toFixed(2) + ' Mbps';
    }
    return (bitsPerSec / 1e3).toFixed(2) + ' Kbps';
  };

  const formatNumber = (num: number): string => {
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return num.toString();
  };

  // Calculator calculations
  const totalRequestsPerDay = dau * reqsPerUser;
  const avgQps = Math.round(totalRequestsPerDay / 86400);
  const peakQps = avgQps * 2;

  const writeQps = Math.round(avgQps * (writeRatio / 100));
  const readQps = Math.max(0, avgQps - writeQps);

  const writePayloadBytes = writePayload * 1024;
  const readPayloadBytes = readPayload * 1024;

  const storagePerDayBytes = writeQps * 86400 * writePayloadBytes;
  const storagePerYearBytes = storagePerDayBytes * 365;
  const totalStorageRetentionBytes = storagePerYearBytes * retentionYears;

  const uploadBandwidthBps = writeQps * writePayloadBytes;
  const downloadBandwidthBps = readQps * readPayloadBytes;

  // Cache calculation using read payload and caching ratio
  const cacheRamRequiredBytes = readQps * 86400 * readPayloadBytes * (cacheRatio / 100);

  // Latency calculations
  const opA = latencyNumbers[opAIndex];
  const opB = latencyNumbers[opBIndex];
  const multiplier = opB.ns / opA.ns;

  // Latency formatted duration helper
  const formatNs = (ns: number): string => {
    if (ns >= 1e9) return (ns / 1e9).toFixed(2) + ' s';
    if (ns >= 1e6) return (ns / 1e6).toFixed(2) + ' ms';
    if (ns >= 1e3) return (ns / 1e3).toFixed(2) + ' µs';
    return ns + ' ns';
  };

  const getAnalogyTime = (ns: number): string => {
    // 1 ns scaled by 1 billion (10^9) equals 1 second
    const scaledSeconds = ns;
    if (scaledSeconds >= 31536000) {
      return (scaledSeconds / 31536000).toFixed(1) + ' years';
    }
    if (scaledSeconds >= 86400) {
      return (scaledSeconds / 86400).toFixed(1) + ' days';
    }
    if (scaledSeconds >= 3600) {
      return (scaledSeconds / 3600).toFixed(1) + ' hours';
    }
    if (scaledSeconds >= 60) {
      return (scaledSeconds / 60).toFixed(1) + ' minutes';
    }
    return scaledSeconds.toFixed(1) + ' seconds';
  };

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 className="glow-text" style={{ fontSize: '36px', fontWeight: 800, marginBottom: '8px' }}>
          Interactive Prep Tools
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Product designer additions built to help you master engineering calculations and latency mental models.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-glass)', marginBottom: '32px' }}>
        <button
          onClick={() => setActiveSubTab('calculator')}
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: activeSubTab === 'calculator' ? '2px solid var(--color-secondary)' : '2px solid transparent',
            color: activeSubTab === 'calculator' ? 'var(--text-primary)' : 'var(--text-secondary)',
            padding: '12px 16px',
            fontSize: '15px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'var(--transition-smooth)'
          }}
        >
          Back-of-the-Envelope Calculator
        </button>
        <button
          onClick={() => setActiveSubTab('latency')}
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: activeSubTab === 'latency' ? '2px solid var(--color-secondary)' : '2px solid transparent',
            color: activeSubTab === 'latency' ? 'var(--text-primary)' : 'var(--text-secondary)',
            padding: '12px 16px',
            fontSize: '15px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'var(--transition-smooth)'
          }}
        >
          Latency Numbers Cheat Sheet
        </button>
      </div>

      {activeSubTab === 'calculator' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '32px', alignItems: 'start' }}>
          {/* Controls Panel */}
          <Card3D style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calculator size={18} style={{ color: 'var(--color-secondary)' }} />
              <span>Input Parameters</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* DAU */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Daily Active Users (DAU)</label>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-secondary)' }}>{formatNumber(dau)}</span>
                </div>
                <input
                  type="range"
                  min={1000000}
                  max={1000000000}
                  step={1000000}
                  value={dau}
                  onChange={(e) => setDau(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--color-secondary)', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                  {[10000000, 50000000, 100000000, 500000000, 1000000000].map(val => (
                    <button
                      key={val}
                      onClick={() => setDau(val)}
                      style={{
                        flexGrow: 1,
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid var(--border-glass)',
                        borderRadius: '4px',
                        color: 'var(--text-secondary)',
                        fontSize: '11px',
                        padding: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      {formatNumber(val)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Requests per user */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Requests / User / Day</label>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-secondary)' }}>{reqsPerUser}</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={200}
                  step={1}
                  value={reqsPerUser}
                  onChange={(e) => setReqsPerUser(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--color-secondary)', cursor: 'pointer' }}
                />
              </div>

              {/* Write/Read Ratio */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Write Ratio (vs Reads)</label>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-gold)' }}>{writeRatio}% Writes</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={50}
                  step={1}
                  value={writeRatio}
                  onChange={(e) => setWriteRatio(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--color-gold)', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                  <span>Read-Heavy (e.g. Feed: 1% - 5%)</span>
                  <span>Balanced (e.g. Chat: 10% - 20%)</span>
                </div>
              </div>

              {/* Read Payload Size */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Read Payload Size</label>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-secondary)' }}>{readPayload} KB</span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={100}
                  step={0.5}
                  value={readPayload}
                  onChange={(e) => setReadPayload(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--color-secondary)', cursor: 'pointer' }}
                />
              </div>

              {/* Write Payload Size */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Write Payload Size</label>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-secondary)' }}>{writePayload} KB</span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={100}
                  step={0.5}
                  value={writePayload}
                  onChange={(e) => setWritePayload(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--color-secondary)', cursor: 'pointer' }}
                />
              </div>

              {/* Data Retention */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Data Retention Years</label>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-secondary)' }}>{retentionYears} Years</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  step={1}
                  value={retentionYears}
                  onChange={(e) => setRetentionYears(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--color-secondary)', cursor: 'pointer' }}
                />
              </div>

              {/* Cache Sizing Slices */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Cache Ratio (Pareto Rule)</label>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-teal)' }}>{cacheRatio}% of Reads</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={50}
                  step={5}
                  value={cacheRatio}
                  onChange={(e) => setCacheRatio(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--color-teal)', cursor: 'pointer' }}
                />
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', margin: 0 }}>
                  Cache size to hold requested read-heavy records (typically 20% of traffic accounts for 80% of volume).
                </p>
              </div>
            </div>
          </Card3D>

          {/* Results Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Traffic Section */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-secondary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} />
                <span>Traffic & QPS Estimates</span>
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)', padding: '16px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Average QPS</div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>{avgQps.toLocaleString()}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>Queries / Sec</div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)', padding: '16px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Peak QPS (2x)</div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>{peakQps.toLocaleString()}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>Peak Traffic load</div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', marginTop: '16px', borderTop: '1px solid var(--border-glass)', paddingTop: '12px' }}>
                <span>Reads QPS: <strong>{readQps.toLocaleString()}</strong></span>
                <span>Writes QPS: <strong>{writeQps.toLocaleString()}</strong></span>
              </div>
            </div>

            {/* Storage Sizing Section */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-gold)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Database size={16} style={{ color: 'var(--color-gold)' }} />
                <span>Storage Requirements</span>
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)', padding: '16px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Storage / Day</div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>{formatBytes(storagePerDayBytes)}</div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)', padding: '16px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Storage ({retentionYears}yr)</div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>{formatBytes(totalStorageRetentionBytes)}</div>
                </div>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Info size={12} />
                <span>Calculated on {writeRatio}% write actions at {writePayload} KB per record. Excludes replicas.</span>
              </div>
            </div>

            {/* Network & Memory Sizing Section */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-teal)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Wifi size={16} style={{ color: 'var(--color-teal)' }} />
                <span>Network & Memory Caching</span>
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)', padding: '16px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Download / Upload B/W</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>{formatBandwidth(downloadBandwidthBps)}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>Upload: {formatBandwidth(uploadBandwidthBps)}</div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)', padding: '16px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Cache RAM (Pareto)</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-teal)', marginTop: '4px' }}>{formatBytes(cacheRamRequiredBytes)}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>To cache {cacheRatio}% daily reads</div>
                </div>
              </div>
            </div>

            {/* Calculation formulas reference */}
            <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)', borderRadius: '12px', padding: '16px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>Back-of-Envelope Formulas:</div>
              <ul style={{ paddingLeft: '16px', lineHeight: '1.6' }}>
                <li><code>Avg QPS = (DAU * ReqsPerUser) / 86,400 seconds</code></li>
                <li><code>Write QPS = Avg QPS * WriteRatio</code></li>
                <li><code>Daily Storage = Write QPS * 86,400 * Write Payload Size</code></li>
                <li><code>Cache RAM = Read QPS * 86,400 * Read Payload Size * CacheRatio</code></li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Interactive Latency Numbers Comparison */}
          <Card3D style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} style={{ color: 'var(--color-secondary)' }} />
              <span>Latency Comparator Sandbox</span>
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
              Select two computer operations to compare their latency. Scaled up by 1 billion, nanoseconds become seconds, letting us understand hardware delays in human timelines.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '20px', alignItems: 'center', marginBottom: '28px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>Operation A</label>
                <select
                  value={opAIndex}
                  onChange={(e) => setOpAIndex(Number(e.target.value))}
                  style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none' }}
                >
                  {latencyNumbers.map((lat, idx) => (
                    <option key={idx} value={idx} style={{ background: '#0b0f19' }}>{lat.name} ({formatNs(lat.ns)})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 0 0' }}>
                <ArrowRight size={24} style={{ color: 'var(--color-secondary)' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>Operation B (Slower)</label>
                <select
                  value={opBIndex}
                  onChange={(e) => setOpBIndex(Number(e.target.value))}
                  style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none' }}
                >
                  {latencyNumbers.map((lat, idx) => (
                    <option key={idx} value={idx} style={{ background: '#0b0f19' }} disabled={lat.ns < latencyNumbers[opAIndex].ns}>
                      {lat.name} ({formatNs(lat.ns)})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Comparison explanation board */}
            <div style={{ background: 'rgba(99,102,241,0.05)', border: '1px dashed var(--color-primary)', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '10px' }}>
                {opB.name} is <span style={{ color: 'var(--color-gold)', fontSize: '22px', fontWeight: 800 }}>{multiplier.toLocaleString(undefined, { maximumFractionDigits: 1 })}x</span> slower than {opA.name}!
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0, lineHeight: '1.6' }}>
                <strong>Analogy:</strong> If {opA.name} took <strong style={{ color: '#fff' }}>1 second</strong>, then performing {opB.name} would take <strong style={{ color: 'var(--color-gold)' }}>{getAnalogyTime(multiplier)}</strong> in human time!
              </p>
            </div>
          </Card3D>

          {/* Reference Numbers Grid */}
          <div className="glass-panel" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HardDrive size={18} style={{ color: 'var(--color-gold)' }} />
              <span>Standard Latency Reference</span>
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: '8px 12px', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, borderBottom: '1px solid var(--border-glass)' }}>
                <span>Operation</span>
                <span>Latency</span>
                <span>Scaled (1s base)</span>
              </div>
              
              {latencyNumbers.map((lat, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr',
                    padding: '12px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    background: idx === opAIndex ? 'rgba(99,102,241,0.06)' : idx === opBIndex ? 'rgba(245,158,11,0.06)' : 'rgba(255,255,255,0.01)',
                    border: '1px solid',
                    borderColor: idx === opAIndex ? 'var(--color-primary)' : idx === opBIndex ? 'var(--color-gold)' : 'transparent',
                    alignItems: 'center',
                    transition: 'var(--transition-smooth)'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{lat.name}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{lat.description}</span>
                    {/* Visual Latency Logarithmic Timeline Bar */}
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.03)', borderRadius: '3px', marginTop: '6px', overflow: 'hidden', width: '90%' }}>
                      <div 
                        style={{ 
                          height: '100%', 
                          background: idx === opAIndex 
                            ? 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-secondary) 100%)' 
                            : idx === opBIndex 
                            ? 'linear-gradient(90deg, var(--color-gold) 0%, #ef4444 100%)' 
                            : 'linear-gradient(90deg, rgba(255,255,255,0.1) 0%, var(--color-secondary) 100%)',
                          width: `${Math.max(3, Math.round(((Math.log10(lat.ns) - Math.log10(0.5)) / (Math.log10(150000000) - Math.log10(0.5))) * 100))}%`,
                          borderRadius: '3px',
                          transition: 'width 0.5s ease-out'
                        }} 
                      />
                    </div>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--color-secondary)' }}>{formatNs(lat.ns)}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{getAnalogyTime(lat.ns)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

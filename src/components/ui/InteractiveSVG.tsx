import React, { useState } from 'react';

interface InteractiveSVGProps {
  problemId: string;
}

export const InteractiveSVG: React.FC<InteractiveSVGProps> = ({ problemId }) => {
  const [activePath, setActivePath] = useState<'write' | 'read' | 'default'>('default');
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const nodeDetails: Record<string, string> = {
    client: "Client: The web browser or mobile client initiating HTTP/WebSocket requests.",
    lb: "Load Balancer: Distributes traffic across web servers (e.g. NGINX, AWS ALB) to prevent single server overloading.",
    webServer: "Web Server: Stateless app servers running application logic, routing databases, and generating short hashes.",
    redis: "Cache (Redis): In-memory key-value cache. Serves read requests in sub-milliseconds to avoid querying the disk-based DB.",
    db: "Database (Cassandra/Postgres): Distributed persistent storage saving original mapping details.",
    idGen: "Unique ID Generator: Distributes sequential 64-bit IDs (Snowflake-like) without coordination overhead.",
    gateway: "API Gateway: Intercepts all traffic. Validates JWT tokens, routes microservices, and enforces rate limit rules.",
    limiterCache: "Redis Token Store: Tracks current token counts and timestamps for every IP/User ID in memory.",
    wsServer: "WebSocket Gateway: Maintains persistent TCP connections with online users to stream messages in real-time.",
    pushNotif: "Push Notification Service: Sends Apple Push (APNs) or Google Cloud (FCM) notifications to offline users.",
    redisGeo: "Redis Geo Index: Stores driver latitude/longitude using geospatial coordinates for fast local queries.",
    dispatch: "Dispatch Service: Matches riders with drivers, computes routes, and runs the surge pricing engine.",
    transcoder: "Transcoding Worker: Compiles raw video chunks into multiple resolutions (1080p, 720p) and stream profiles.",
    cdn: "CDN Edge Server: Caches transcoded video segments geographically close to users to eliminate playback buffering.",
    broker: "Kafka Broker: Appends events sequentially to disk partition log files for consumer groups.",
    lockManager: "Distributed Lock Manager: Acquires pessimistic locks on seat IDs in Redis to prevent double booking."
  };

  const handleNodeClick = (nodeId: string) => {
    setSelectedNode(selectedNode === nodeId ? null : nodeId);
  };

  const renderUrlShortener = () => {
    const isWrite = activePath === 'write';
    const isRead = activePath === 'read';

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button 
            className={`nav-link ${activePath === 'write' ? 'active' : ''}`} 
            style={{ padding: '8px 16px', fontSize: '13px' }}
            onClick={() => setActivePath('write')}
          >
            Show Write Path (Shorten)
          </button>
          <button 
            className={`nav-link ${activePath === 'read' ? 'active' : ''}`}
            style={{ padding: '8px 16px', fontSize: '13px' }}
            onClick={() => setActivePath('read')}
          >
            Show Read Path (Redirect)
          </button>
          <button 
            className={`nav-link ${activePath === 'default' ? 'active' : ''}`}
            style={{ padding: '8px 16px', fontSize: '13px' }}
            onClick={() => { setActivePath('default'); setSelectedNode(null); }}
          >
            Reset view
          </button>
        </div>

        <svg viewBox="0 0 800 380" width="100%" height="auto" style={{ background: 'rgba(10,15,30,0.5)', borderRadius: '12px', border: '1px solid var(--border-glass)', padding: '20px' }}>
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
            </marker>
            <marker id="arrow-green" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--color-teal)" />
            </marker>
            <marker id="arrow-blue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--color-secondary)" />
            </marker>
          </defs>

          {/* Client Node */}
          <g className="svg-node" onClick={() => handleNodeClick('client')}>
            <rect x="30" y="150" width="110" height="60" rx="10" fill="rgba(255,255,255,0.05)" stroke={selectedNode === 'client' ? 'var(--color-primary)' : 'var(--border-glass)'} strokeWidth="2" />
            <text x="85" y="185" fill="#f8fafc" textAnchor="middle" fontSize="13" fontWeight="600">Client / Browser</text>
          </g>

          {/* Load Balancer Node */}
          <g className="svg-node" onClick={() => handleNodeClick('lb')}>
            <rect x="200" y="150" width="110" height="60" rx="10" fill="rgba(255,255,255,0.05)" stroke={selectedNode === 'lb' ? 'var(--color-primary)' : 'var(--border-glass)'} strokeWidth="2" />
            <text x="255" y="185" fill="#f8fafc" textAnchor="middle" fontSize="13" fontWeight="600">Load Balancer</text>
          </g>

          {/* Web Servers Node */}
          <g className="svg-node" onClick={() => handleNodeClick('webServer')}>
            <rect x="370" y="150" width="110" height="60" rx="10" fill="rgba(255,255,255,0.05)" stroke={selectedNode === 'webServer' ? 'var(--color-primary)' : 'var(--border-glass)'} strokeWidth="2" />
            <text x="425" y="185" fill="#f8fafc" textAnchor="middle" fontSize="13" fontWeight="600">Web Servers</text>
          </g>

          {/* Unique ID Generator Node */}
          <g className="svg-node" onClick={() => handleNodeClick('idGen')}>
            <rect x="370" y="40" width="110" height="60" rx="10" fill="rgba(99,102,241,0.05)" stroke={selectedNode === 'idGen' ? 'var(--color-primary)' : 'rgba(99,102,241,0.3)'} strokeWidth="2" />
            <text x="425" y="75" fill="var(--color-primary)" textAnchor="middle" fontSize="13" fontWeight="600">ID Generator</text>
          </g>

          {/* Redis Cache Node */}
          <g className="svg-node" onClick={() => handleNodeClick('redis')}>
            <rect x="540" y="70" width="110" height="60" rx="10" fill="rgba(14,165,233,0.05)" stroke={selectedNode === 'redis' ? 'var(--color-primary)' : 'rgba(14,165,233,0.3)'} strokeWidth="2" />
            <text x="595" y="105" fill="var(--color-secondary)" textAnchor="middle" fontSize="13" fontWeight="600">Redis Cache</text>
          </g>

          {/* DB Node */}
          <g className="svg-node" onClick={() => handleNodeClick('db')}>
            <rect x="540" y="230" width="110" height="60" rx="10" fill="rgba(16,185,129,0.05)" stroke={selectedNode === 'db' ? 'var(--color-primary)' : 'rgba(16,185,129,0.3)'} strokeWidth="2" />
            <text x="595" y="265" fill="var(--color-teal)" textAnchor="middle" fontSize="13" fontWeight="600">Database</text>
          </g>

          {/* Connectors */}
          {/* Client -> LB */}
          <line x1="140" y1="180" x2="200" y2="180" stroke={isWrite ? 'var(--color-teal)' : isRead ? 'var(--color-secondary)' : '#64748b'} strokeWidth={isWrite || isRead ? '3' : '1.5'} markerEnd={isWrite ? 'url(#arrow-green)' : isRead ? 'url(#arrow-blue)' : 'url(#arrow)'} />
          {isWrite && <path d="M 140 180 L 200 180" className="svg-flow-line" stroke="var(--color-teal)" />}
          {isRead && <path d="M 140 180 L 200 180" className="svg-flow-line" />}

          {/* LB -> Web Servers */}
          <line x1="310" y1="180" x2="370" y2="180" stroke={isWrite ? 'var(--color-teal)' : isRead ? 'var(--color-secondary)' : '#64748b'} strokeWidth={isWrite || isRead ? '3' : '1.5'} markerEnd={isWrite ? 'url(#arrow-green)' : isRead ? 'url(#arrow-blue)' : 'url(#arrow)'} />
          {isWrite && <path d="M 310 180 L 370 180" className="svg-flow-line" stroke="var(--color-teal)" />}
          {isRead && <path d="M 310 180 L 370 180" className="svg-flow-line" />}

          {/* Web Server -> ID Gen */}
          <line x1="425" y1="150" x2="425" y2="100" stroke={isWrite ? 'var(--color-teal)' : '#64748b'} strokeWidth={isWrite ? '3' : '1.5'} markerEnd={isWrite ? 'url(#arrow-green)' : 'url(#arrow)'} />
          {isWrite && <path d="M 425 150 L 425 100" className="svg-flow-line" stroke="var(--color-teal)" />}

          {/* Web Server -> Cache */}
          <path d="M 480 160 Q 510 130 540 110" fill="none" stroke={isWrite || isRead ? 'var(--color-secondary)' : '#64748b'} strokeWidth={isWrite || isRead ? '3' : '1.5'} markerEnd="url(#arrow-blue)" />
          {(isWrite || isRead) && <path d="M 480 160 Q 510 130 540 110" fill="none" className="svg-flow-line" />}

          {/* Web Server -> DB */}
          <path d="M 480 200 Q 510 230 540 250" fill="none" stroke={isWrite ? 'var(--color-teal)' : isRead ? '#64748b' : '#64748b'} strokeWidth={isWrite ? '3' : '1.5'} markerEnd={isWrite ? 'url(#arrow-green)' : 'url(#arrow)'} />
          {isWrite && <path d="M 480 200 Q 510 230 540 250" fill="none" className="svg-flow-line" stroke="var(--color-teal)" />}
        </svg>
      </div>
    );
  };

  const renderRateLimiter = () => {
    return (
      <svg viewBox="0 0 800 280" width="100%" height="auto" style={{ background: 'rgba(10,15,30,0.5)', borderRadius: '12px', border: '1px solid var(--border-glass)', padding: '20px' }}>
        <g className="svg-node" onClick={() => handleNodeClick('client')}>
          <rect x="30" y="110" width="110" height="60" rx="10" fill="rgba(255,255,255,0.05)" stroke={selectedNode === 'client' ? 'var(--color-primary)' : 'var(--border-glass)'} strokeWidth="2" />
          <text x="85" y="145" fill="#f8fafc" textAnchor="middle" fontSize="13" fontWeight="600">Client Request</text>
        </g>

        <g className="svg-node" onClick={() => handleNodeClick('gateway')}>
          <rect x="230" y="110" width="120" height="60" rx="10" fill="rgba(99,102,241,0.05)" stroke={selectedNode === 'gateway' ? 'var(--color-primary)' : 'rgba(99,102,241,0.3)'} strokeWidth="2" />
          <text x="290" y="145" fill="var(--color-primary)" textAnchor="middle" fontSize="13" fontWeight="600">API Gateway / LB</text>
        </g>

        <g className="svg-node" onClick={() => handleNodeClick('limiterCache')}>
          <rect x="460" y="40" width="130" height="60" rx="10" fill="rgba(14,165,233,0.05)" stroke={selectedNode === 'limiterCache' ? 'var(--color-primary)' : 'rgba(14,165,233,0.3)'} strokeWidth="2" />
          <text x="525" y="75" fill="var(--color-secondary)" textAnchor="middle" fontSize="13" fontWeight="600">Redis (Token Store)</text>
        </g>

        <g className="svg-node" onClick={() => handleNodeClick('webServer')}>
          <rect x="460" y="180" width="130" height="60" rx="10" fill="rgba(16,185,129,0.05)" stroke={selectedNode === 'webServer' ? 'var(--color-primary)' : 'rgba(16,185,129,0.3)'} strokeWidth="2" />
          <text x="525" y="215" fill="var(--color-teal)" textAnchor="middle" fontSize="13" fontWeight="600">Backend API</text>
        </g>

        {/* Lines */}
        <line x1="140" y1="140" x2="230" y2="140" stroke="#64748b" strokeWidth="2" />
        <path d="M 140 140 L 230 140" className="svg-flow-line" />

        <path d="M 350 130 Q 405 95 460 75" fill="none" stroke="var(--color-secondary)" strokeWidth="2" />
        <path d="M 350 130 Q 405 95 460 75" fill="none" className="svg-flow-line" />

        <path d="M 350 150 Q 405 185 460 205" fill="none" stroke="var(--color-teal)" strokeWidth="2" />
        <path d="M 350 150 Q 405 185 460 205" fill="none" className="svg-flow-line" stroke="var(--color-teal)" />
      </svg>
    );
  };

  const renderChatService = () => {
    return (
      <svg viewBox="0 0 800 300" width="100%" height="auto" style={{ background: 'rgba(10,15,30,0.5)', borderRadius: '12px', border: '1px solid var(--border-glass)', padding: '20px' }}>
        <g className="svg-node" onClick={() => handleNodeClick('client')}>
          <rect x="30" y="120" width="100" height="60" rx="10" fill="rgba(255,255,255,0.05)" stroke={selectedNode === 'client' ? 'var(--color-primary)' : 'var(--border-glass)'} strokeWidth="2" />
          <text x="80" y="155" fill="#f8fafc" textAnchor="middle" fontSize="13" fontWeight="600">Alice (Client)</text>
        </g>

        <g className="svg-node" onClick={() => handleNodeClick('wsServer')}>
          <rect x="220" y="120" width="120" height="60" rx="10" fill="rgba(99,102,241,0.05)" stroke={selectedNode === 'wsServer' ? 'var(--color-primary)' : 'rgba(99,102,241,0.3)'} strokeWidth="2" />
          <text x="280" y="155" fill="var(--color-primary)" textAnchor="middle" fontSize="13" fontWeight="600">WebSocket Server</text>
        </g>

        <g className="svg-node" onClick={() => handleNodeClick('redis')}>
          <rect x="430" y="40" width="120" height="60" rx="10" fill="rgba(14,165,233,0.05)" stroke={selectedNode === 'redis' ? 'var(--color-primary)' : 'rgba(14,165,233,0.3)'} strokeWidth="2" />
          <text x="490" y="75" fill="var(--color-secondary)" textAnchor="middle" fontSize="13" fontWeight="600">Redis (Sessions)</text>
        </g>

        <g className="svg-node" onClick={() => handleNodeClick('db')}>
          <rect x="430" y="200" width="120" height="60" rx="10" fill="rgba(16,185,129,0.05)" stroke={selectedNode === 'db' ? 'var(--color-primary)' : 'rgba(16,185,129,0.3)'} strokeWidth="2" />
          <text x="490" y="235" fill="var(--color-teal)" textAnchor="middle" fontSize="13" fontWeight="600">Cassandra DB</text>
        </g>

        <g className="svg-node" onClick={() => handleNodeClick('pushNotif')}>
          <rect x="630" y="120" width="120" height="60" rx="10" fill="rgba(245,158,11,0.05)" stroke={selectedNode === 'pushNotif' ? 'var(--color-primary)' : 'rgba(245,158,11,0.3)'} strokeWidth="2" />
          <text x="690" y="155" fill="var(--color-gold)" textAnchor="middle" fontSize="13" fontWeight="600">Push (FCM/APNs)</text>
        </g>

        {/* WebSocket Lines */}
        <line x1="130" y1="150" x2="220" y2="150" stroke="var(--color-primary)" strokeWidth="2.5" strokeDasharray="5,3" />
        <path d="M 130 150 L 220 150" className="svg-flow-line" stroke="var(--color-primary)" />

        <line x1="340" y1="150" x2="630" y2="150" stroke="#64748b" strokeWidth="1.5" />

        <path d="M 280 120 L 430 70" fill="none" stroke="var(--color-secondary)" strokeWidth="1.5" />
        <path d="M 280 120 L 430 70" fill="none" className="svg-flow-line" />

        <path d="M 280 180 L 430 230" fill="none" stroke="var(--color-teal)" strokeWidth="1.5" />
        <path d="M 280 180 L 430 230" fill="none" className="svg-flow-line" stroke="var(--color-teal)" />
      </svg>
    );
  };

  const renderRideSharing = () => {
    return (
      <svg viewBox="0 0 800 280" width="100%" height="auto" style={{ background: 'rgba(10,15,30,0.5)', borderRadius: '12px', border: '1px solid var(--border-glass)', padding: '20px' }}>
        <g className="svg-node" onClick={() => handleNodeClick('client')}>
          <rect x="30" y="110" width="100" height="60" rx="10" fill="rgba(255,255,255,0.05)" stroke={selectedNode === 'client' ? 'var(--color-primary)' : 'var(--border-glass)'} strokeWidth="2" />
          <text x="80" y="145" fill="#f8fafc" textAnchor="middle" fontSize="13" fontWeight="600">Rider Request</text>
        </g>

        <g className="svg-node" onClick={() => handleNodeClick('dispatch')}>
          <rect x="230" y="110" width="120" height="60" rx="10" fill="rgba(99,102,241,0.05)" stroke={selectedNode === 'dispatch' ? 'var(--color-primary)' : 'rgba(99,102,241,0.3)'} strokeWidth="2" />
          <text x="290" y="145" fill="var(--color-primary)" textAnchor="middle" fontSize="13" fontWeight="600">Dispatch Service</text>
        </g>

        <g className="svg-node" onClick={() => handleNodeClick('redisGeo')}>
          <rect x="450" y="40" width="130" height="60" rx="10" fill="rgba(14,165,233,0.05)" stroke={selectedNode === 'redisGeo' ? 'var(--color-primary)' : 'rgba(14,165,233,0.3)'} strokeWidth="2" />
          <text x="515" y="75" fill="var(--color-secondary)" textAnchor="middle" fontSize="13" fontWeight="600">Redis Geo (H3)</text>
        </g>

        <g className="svg-node" onClick={() => handleNodeClick('client')}>
          <rect x="650" y="110" width="110" height="60" rx="10" fill="rgba(16,185,129,0.05)" stroke={selectedNode === 'client' ? 'var(--color-primary)' : 'var(--border-glass)'} strokeWidth="2" />
          <text x="705" y="145" fill="var(--color-teal)" textAnchor="middle" fontSize="13" fontWeight="600">Closest Driver</text>
        </g>

        <line x1="130" y1="140" x2="230" y2="140" stroke="#64748b" strokeWidth="2" />
        <path d="M 130 140 L 230 140" className="svg-flow-line" />

        <path d="M 290 110 L 450 70" fill="none" stroke="var(--color-secondary)" strokeWidth="2" />
        <path d="M 290 110 L 450 70" fill="none" className="svg-flow-line" />

        <path d="M 350 140 L 650 140" fill="none" stroke="var(--color-teal)" strokeWidth="2.5" />
        <path d="M 350 140 L 650 140" fill="none" className="svg-flow-line" stroke="var(--color-teal)" />
      </svg>
    );
  };

  const renderVideoStreaming = () => {
    return (
      <svg viewBox="0 0 800 280" width="100%" height="auto" style={{ background: 'rgba(10,15,30,0.5)', borderRadius: '12px', border: '1px solid var(--border-glass)', padding: '20px' }}>
        <g className="svg-node" onClick={() => handleNodeClick('client')}>
          <rect x="30" y="110" width="100" height="60" rx="10" fill="rgba(255,255,255,0.05)" stroke={selectedNode === 'client' ? 'var(--color-primary)' : 'var(--border-glass)'} strokeWidth="2" />
          <text x="80" y="145" fill="#f8fafc" textAnchor="middle" fontSize="13" fontWeight="600">Video Uploader</text>
        </g>

        <g className="svg-node" onClick={() => handleNodeClick('transcoder')}>
          <rect x="230" y="110" width="140" height="60" rx="10" fill="rgba(99,102,241,0.05)" stroke={selectedNode === 'transcoder' ? 'var(--color-primary)' : 'rgba(99,102,241,0.3)'} strokeWidth="2" />
          <text x="300" y="145" fill="var(--color-primary)" textAnchor="middle" fontSize="13" fontWeight="600">Transcoder Workers</text>
        </g>

        <g className="svg-node" onClick={() => handleNodeClick('cdn')}>
          <rect x="470" y="110" width="120" height="60" rx="10" fill="rgba(14,165,233,0.05)" stroke={selectedNode === 'cdn' ? 'var(--color-primary)' : 'rgba(14,165,233,0.3)'} strokeWidth="2" />
          <text x="530" y="145" fill="var(--color-secondary)" textAnchor="middle" fontSize="13" fontWeight="600">CDN Edge Servers</text>
        </g>

        <g className="svg-node" onClick={() => handleNodeClick('client')}>
          <rect x="670" y="110" width="100" height="60" rx="10" fill="rgba(16,185,129,0.05)" stroke={selectedNode === 'client' ? 'var(--color-primary)' : 'var(--border-glass)'} strokeWidth="2" />
          <text x="720" y="145" fill="var(--color-teal)" textAnchor="middle" fontSize="13" fontWeight="600">Viewer / Client</text>
        </g>

        <line x1="130" y1="140" x2="230" y2="140" stroke="#64748b" strokeWidth="2" />
        <path d="M 130 140 L 230 140" className="svg-flow-line" />

        <line x1="370" y1="140" x2="470" y2="140" stroke="var(--color-secondary)" strokeWidth="2.5" />
        <path d="M 370 140 L 470 140" className="svg-flow-line" />

        <line x1="590" y1="140" x2="670" y2="140" stroke="var(--color-teal)" strokeWidth="2.5" />
        <path d="M 590 140 L 670 140" className="svg-flow-line" stroke="var(--color-teal)" />
      </svg>
    );
  };

  const renderMessageQueue = () => {
    return (
      <svg viewBox="0 0 800 280" width="100%" height="auto" style={{ background: 'rgba(10,15,30,0.5)', borderRadius: '12px', border: '1px solid var(--border-glass)', padding: '20px' }}>
        <g className="svg-node" onClick={() => handleNodeClick('client')}>
          <rect x="30" y="110" width="100" height="60" rx="10" fill="rgba(255,255,255,0.05)" stroke={selectedNode === 'client' ? 'var(--color-primary)' : 'var(--border-glass)'} strokeWidth="2" />
          <text x="80" y="145" fill="#f8fafc" textAnchor="middle" fontSize="13" fontWeight="600">Producers</text>
        </g>

        <g className="svg-node" onClick={() => handleNodeClick('broker')}>
          <rect x="230" y="40" width="340" height="200" rx="10" fill="rgba(99,102,241,0.02)" stroke="var(--border-glass)" strokeWidth="1.5" />
          <text x="400" y="65" fill="#94a3b8" textAnchor="middle" fontSize="13" fontWeight="600">Kafka Broker (Partition Commit Logs)</text>
          
          <rect x="260" y="90" width="280" height="40" rx="5" fill="rgba(14,165,233,0.05)" stroke="rgba(14,165,233,0.3)" />
          <text x="400" y="115" fill="var(--color-secondary)" textAnchor="middle" fontSize="12">Partition 0: [Msg 0] [Msg 1] [Msg 2]</text>

          <rect x="260" y="150" width="280" height="40" rx="5" fill="rgba(14,165,233,0.05)" stroke="rgba(14,165,233,0.3)" />
          <text x="400" y="175" fill="var(--color-secondary)" textAnchor="middle" fontSize="12">Partition 1: [Msg 0] [Msg 1]</text>
        </g>

        <g className="svg-node" onClick={() => handleNodeClick('client')}>
          <rect x="670" y="110" width="100" height="60" rx="10" fill="rgba(16,185,129,0.05)" stroke={selectedNode === 'client' ? 'var(--color-primary)' : 'var(--border-glass)'} strokeWidth="2" />
          <text x="720" y="145" fill="var(--color-teal)" textAnchor="middle" fontSize="13" fontWeight="600">Consumers</text>
        </g>

        <line x1="130" y1="140" x2="230" y2="140" stroke="var(--color-secondary)" strokeWidth="2" />
        <path d="M 130 140 L 230 140" className="svg-flow-line" />

        <line x1="570" y1="140" x2="670" y2="140" stroke="var(--color-teal)" strokeWidth="2" />
        <path d="M 570 140 L 670 140" className="svg-flow-line" stroke="var(--color-teal)" />
      </svg>
    );
  };

  const renderTicketBooking = () => {
    return (
      <svg viewBox="0 0 800 280" width="100%" height="auto" style={{ background: 'rgba(10,15,30,0.5)', borderRadius: '12px', border: '1px solid var(--border-glass)', padding: '20px' }}>
        <g className="svg-node" onClick={() => handleNodeClick('client')}>
          <rect x="30" y="110" width="100" height="60" rx="10" fill="rgba(255,255,255,0.05)" stroke={selectedNode === 'client' ? 'var(--color-primary)' : 'var(--border-glass)'} strokeWidth="2" />
          <text x="80" y="145" fill="#f8fafc" textAnchor="middle" fontSize="13" fontWeight="600">Users</text>
        </g>

        <g className="svg-node" onClick={() => handleNodeClick('lockManager')}>
          <rect x="230" y="110" width="140" height="60" rx="10" fill="rgba(99,102,241,0.05)" stroke={selectedNode === 'lockManager' ? 'var(--color-primary)' : 'rgba(99,102,241,0.3)'} strokeWidth="2" />
          <text x="300" y="145" fill="var(--color-primary)" textAnchor="middle" fontSize="13" fontWeight="600">Reservation Lock API</text>
        </g>

        <g className="svg-node" onClick={() => handleNodeClick('redis')}>
          <rect x="470" y="40" width="120" height="60" rx="10" fill="rgba(14,165,233,0.05)" stroke={selectedNode === 'redis' ? 'var(--color-primary)' : 'rgba(14,165,233,0.3)'} strokeWidth="2" />
          <text x="530" y="75" fill="var(--color-secondary)" textAnchor="middle" fontSize="13" fontWeight="600">Redis (Lock TTL)</text>
        </g>

        <g className="svg-node" onClick={() => handleNodeClick('db')}>
          <rect x="470" y="180" width="120" height="60" rx="10" fill="rgba(16,185,129,0.05)" stroke={selectedNode === 'db' ? 'var(--color-primary)' : 'rgba(16,185,129,0.3)'} strokeWidth="2" />
          <text x="530" y="215" fill="var(--color-teal)" textAnchor="middle" fontSize="13" fontWeight="600">SQL Transaction</text>
        </g>

        <line x1="130" y1="140" x2="230" y2="140" stroke="#64748b" strokeWidth="2" />
        <path d="M 130 140 L 230 140" className="svg-flow-line" />

        <path d="M 370 130 Q 420 95 470 75" fill="none" stroke="var(--color-secondary)" strokeWidth="2" />
        <path d="M 370 130 Q 420 95 470 75" fill="none" className="svg-flow-line" />

        <path d="M 370 150 Q 420 185 470 205" fill="none" stroke="var(--color-teal)" strokeWidth="2" />
        <path d="M 370 150 Q 420 185 470 205" fill="none" className="svg-flow-line" stroke="var(--color-teal)" />
      </svg>
    );
  };

  const renderWebCrawler = () => {
    return (
      <svg viewBox="0 0 800 280" width="100%" height="auto" style={{ background: 'rgba(10,15,30,0.5)', borderRadius: '12px', border: '1px solid var(--border-glass)', padding: '20px' }}>
        <g className="svg-node" onClick={() => handleNodeClick('client')}>
          <rect x="30" y="110" width="120" height="60" rx="10" fill="rgba(255,255,255,0.05)" stroke={selectedNode === 'client' ? 'var(--color-primary)' : 'var(--border-glass)'} strokeWidth="2" />
          <text x="90" y="145" fill="#f8fafc" textAnchor="middle" fontSize="13" fontWeight="600">URL Frontier Queue</text>
        </g>

        <g className="svg-node" onClick={() => handleNodeClick('webServer')}>
          <rect x="250" y="110" width="120" height="60" rx="10" fill="rgba(99,102,241,0.05)" stroke={selectedNode === 'webServer' ? 'var(--color-primary)' : 'rgba(99,102,241,0.3)'} strokeWidth="2" />
          <text x="310" y="145" fill="var(--color-primary)" textAnchor="middle" fontSize="13" fontWeight="600">Downloader Worker</text>
        </g>

        <g className="svg-node" onClick={() => handleNodeClick('redis')}>
          <rect x="470" y="40" width="120" height="60" rx="10" fill="rgba(14,165,233,0.05)" stroke={selectedNode === 'redis' ? 'var(--color-primary)' : 'rgba(14,165,233,0.3)'} strokeWidth="2" />
          <text x="530" y="75" fill="var(--color-secondary)" textAnchor="middle" fontSize="13" fontWeight="600">Bloom Filter (Dup)</text>
        </g>

        <g className="svg-node" onClick={() => handleNodeClick('db')}>
          <rect x="470" y="180" width="120" height="60" rx="10" fill="rgba(16,185,129,0.05)" stroke={selectedNode === 'db' ? 'var(--color-primary)' : 'rgba(16,185,129,0.3)'} strokeWidth="2" />
          <text x="530" y="215" fill="var(--color-teal)" textAnchor="middle" fontSize="13" fontWeight="600">Storage / Index</text>
        </g>

        <line x1="150" y1="140" x2="250" y2="140" stroke="#64748b" strokeWidth="2" />
        <path d="M 150 140 L 250 140" className="svg-flow-line" />

        <path d="M 370 130 Q 420 95 470 75" fill="none" stroke="var(--color-secondary)" strokeWidth="2" />
        <path d="M 370 130 Q 420 95 470 75" fill="none" className="svg-flow-line" />

        <path d="M 370 150 Q 420 185 470 205" fill="none" stroke="var(--color-teal)" strokeWidth="2" />
        <path d="M 370 150 Q 420 185 470 205" fill="none" className="svg-flow-line" stroke="var(--color-teal)" />
      </svg>
    );
  };

  const getDiagram = () => {
    switch (problemId) {
      case 'url-shortener':
        return renderUrlShortener();
      case 'rate-limiter':
        return renderRateLimiter();
      case 'chat-service':
        return renderChatService();
      case 'ride-sharing':
        return renderRideSharing();
      case 'video-streaming':
        return renderVideoStreaming();
      case 'message-queue':
        return renderMessageQueue();
      case 'ticket-booking':
        return renderTicketBooking();
      case 'web-crawler':
        return renderWebCrawler();
      default:
        return (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            Diagram description is loaded below.
          </div>
        );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
        Interactive High-Level Architecture
      </div>
      {getDiagram()}
      {selectedNode && (
        <div className="glass-panel" style={{ padding: '16px', borderLeft: '4px solid var(--color-primary)', background: 'rgba(99, 102, 241, 0.05)' }}>
          <p style={{ fontSize: '13px', margin: 0, color: 'var(--text-primary)' }}>
            {nodeDetails[selectedNode] || "Component details are loaded."}
          </p>
        </div>
      )}
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' }}>
        💡 Click on the boxes to inspect specific component details. Toggle flows above.
      </div>
    </div>
  );
};

export const videoStreamingDetail = {
  problemStatement: `Design a Video Streaming Service like Netflix or YouTube. The system must ingest raw video uploads, transcode them into multiple formats and resolutions, distribute them to edge CDN servers, and stream them to clients with minimal buffering using Adaptive Bitrate Streaming (HLS/DASH).`,
  useCases: [
    "Users can upload videos (YouTube) or content is ingested from studios (Netflix).",
    "Transcode videos into multiple formats (MP4, WebM) and resolutions (1080p, 720p, 480p).",
    "Stream videos to clients with low startup latency and adapt quality based on user's bandwidth (HLS/DASH).",
    "Store video content reliably and cache popular videos globally using CDNs.",
    "Record viewing progress (resume watching) and support user analytics."
  ],
  highLevelDesign: `### High Level System Architecture

1. **Video Ingestion & Transcoding Pipeline**:
   - Raw video is uploaded to an **Inbound Storage Bucket (S3/GCS)**.
   - The upload triggers a notification to the **Transcoding Manager**.
   - The manager splits the video into small chunks (e.g., 4-second blocks) and pushes them to a message queue.
   - **Transcoding Workers** process chunks in parallel, encoding them into target resolutions (4K, 1080p, 720p, 360p) and packaging formats (HLS/DASH).
   - Transcoded chunks are stored in the **Asset Storage Bucket**.
2. **Content Delivery Network (CDN)**:
   - Client requests are routed to the nearest **CDN Edge Server**.
   - Edge servers cache the video chunks. Popular videos are widely distributed, while long-tail content is pulled on-demand from origin servers.
3. **API & Metadata Services**:
   - Handles authentication, search, recommendation, progress tracking (user heartbeat saving viewing offsets every 10 seconds), and generates the video manifest file (.m3u8 or .mpd).`,
  tradeoffs: [
    {
      component: "Video Delivery Protocol",
      optionA: "Direct File Download (Progressive MP4 over HTTP)",
      optionB: "Adaptive Bitrate Streaming (HLS / MPEG-DASH)",
      selected: "Adaptive Bitrate Streaming (HLS / MPEG-DASH)",
      reason: "Direct MP4 downloads waste bandwidth (downloads video the user might not finish watching) and cannot adjust to network conditions. HLS/DASH splits videos into 2-10 second chunks and provides a index manifest file. The client player dynamically requests chunks of higher or lower resolution depending on its current download speed."
    },
    {
      component: "Transcoding Architecture",
      optionA: "Single monolithic transcoding server per video",
      optionB: "Chunked distributed parallel transcoding workers",
      selected: "Chunked distributed parallel transcoding workers",
      reason: "Transcoding a full 2-hour movie on a single machine takes hours and if the server crashes, the work is lost. By splitting the video into thousands of 5-second segments, we can process them concurrently on a serverless compute cluster (e.g. AWS Lambda/Kubernetes pods), reducing transcoding time to minutes."
    },
    {
      component: "Viewing Progress Tracking",
      optionA: "Save offset in DB on every second of playback",
      optionB: "Periodic Client Heartbeats (every 10-15 seconds) + Memory Buffer",
      selected: "Periodic Client Heartbeats (every 10-15 seconds) + Memory Buffer",
      reason: "Writing viewing offset to a primary database on every single second for millions of viewers creates a colossal write load. Sending heartbeats every 10 seconds throttles writes by 90% and is more than accurate enough to resume playback from where the user left off."
    }
  ],
  lowLevelDesign: {
    entities: [
      {
        name: "VideoMetadata (Database Table)",
        fields: [
          "video_id: UUID (Primary Key)",
          "title: VARCHAR(256)",
          "description: TEXT",
          "manifest_url: VARCHAR(512)",
          "duration_seconds: INT",
          "created_at: TIMESTAMP"
        ]
      },
      {
        name: "UserWatchHistory (Database Table)",
        fields: [
          "user_id: UUID (Partition Key)",
          "video_id: UUID (Clustering Key)",
          "last_watched_offset_seconds: INT",
          "updated_at: TIMESTAMP"
        ]
      }
    ],
    apis: [
      {
        method: "GET",
        path: "/api/v1/video/{videoId}/manifest",
        request: "Header: Authorization",
        response: `{ "manifestUrl": "https://cdn.example.com/vid123/master.m3u8", "streams": [{ "resolution": "1080p", "bandwidth": 5000000 }, { "resolution": "720p", "bandwidth": 2500000 }] }`,
        description: "Returns the HLS master playlist URL linking to different quality stream indices."
      },
      {
        method: "POST",
        path: "/api/v1/video/progress",
        request: `{ "videoId": "vid-123", "offsetSeconds": 1420 }`,
        response: `{ "status": "saved" }`,
        description: "Heartbeat endpoint called by video player to save playback progress."
      }
    ]
  },
  code: {
    typescript: `// TypeScript Video Streaming Client-Side Manifest Mockup
export interface VideoStreamQuality {
  resolution: string;
  bandwidthBps: number;
  playlistUrl: string;
}

export class VideoPlayerEngine {
  private qualities: VideoStreamQuality[] = [];
  private currentOffset = 0;

  constructor(qualities: VideoStreamQuality[]) {
    this.qualities = qualities.sort((a, b) => b.bandwidthBps - a.bandwidthBps); // descending
  }

  // Decides which quality chunk to request next
  public selectBestQuality(currentBandwidthBps: number): VideoStreamQuality {
    for (const quality of this.qualities) {
      if (currentBandwidthBps >= quality.bandwidthBps * 1.2) {
        return quality; // Select highest quality we can support comfortably
      }
    }
    return this.qualities[this.qualities.length - 1]; // Return lowest quality if bandwidth is poor
  }

  public updatePlaybackProgress(offsetSeconds: number): void {
    this.currentOffset = offsetSeconds;
    // Debounced network save
  }
}`,
    python: `# Python Transcoding Pipeline simulation
import uuid

class TranscodingTask:
    def __init__(self, video_id: str, chunk_index: int, source_path: str):
        self.task_id = str(uuid.uuid4())
        self.video_id = video_id
        self.chunk_index = chunk_index
        self.source_path = source_path
        self.status = "PENDING"

class TranscoderWorker:
    def transcode_chunk(self, task: TranscodingTask, target_resolution: str) -> str:
        # Simulating running ffmpeg shell commands
        print(f"Transcoding chunk {task.chunk_index} of video {task.video_id} to {target_resolution}...")
        task.status = "COMPLETED"
        return f"/bucket/transcoded/{task.video_id}/{target_resolution}/chunk_{task.chunk_index}.ts"

# Simulation
# worker = TranscoderWorker()
# task = TranscodingTask("vid-789", 42, "/bucket/raw/vid-789/chunk_42.raw")
# path = worker.transcode_chunk(task, "1080p")`,
    java: `// Java Manifest Generator
import java.util.ArrayList;
import java.util.List;

public class HlsManifestGenerator {
    public static class QualityStream {
        public String resolution;
        public int bandwidth;
        public String path;

        public QualityStream(String resolution, int bandwidth, String path) {
            this.resolution = resolution;
            this.bandwidth = bandwidth;
            this.path = path;
        }
    }

    public String generateMasterPlaylist(String videoId, List<QualityStream> streams) {
        StringBuilder sb = new StringBuilder();
        sb.append("#EXTM3U\\n");
        sb.append("#EXT-X-VERSION:3\\n");
        
        for (QualityStream stream : streams) {
            sb.append(String.format("#EXT-X-STREAM-INF:BANDWIDTH=%d,RESOLUTION=%s\\n", 
                stream.bandwidth, stream.resolution));
            sb.append(String.format("https://cdn.example.com/videos/%s/%s\\n", videoId, stream.path));
        }
        return sb.toString();
    }
}`,
    go: `// Go chunk delivery service
package main

import (
	"fmt"
	"net/http"
)

type VideoChunkHandler struct {
	cdnDomain string
}

func (h *VideoChunkHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	// Parse /video/{id}/{resolution}/{chunkIndex}.ts
	// E.g., /video/vid-001/1080p/chunk_004.ts
	path := r.URL.Path
	
	// Real system would fetch from local disk cache,
	// or pull from Origin storage bucket on cache miss.
	w.Header().Set("Content-Type", "video/MP2T")
	w.Header().Set("Cache-Control", "public, max-age=31536000") // cache chunks for 1 year
	
	fmt.Fprintf(w, "Simulating binary stream for chunk: %s", path)
}`,
    cpp: `// C++ Playback Buffer Simulator
#include <iostream>
#include <vector>
#include <string>
#include <thread>
#include <chrono>

class VideoBuffer {
private:
    int bufferCapacityChunks = 10;
    std::vector<std::string> bufferedChunks;

public:
    void addChunk(const std::string& chunkUrl) {
        if (bufferedChunks.size() >= bufferCapacityChunks) {
            std::cout << "Buffer full. Evicting oldest chunk.\\n";
            bufferedChunks.erase(bufferedChunks.begin());
        }
        bufferedChunks.push_back(chunkUrl);
        std::cout << "Buffered chunk: " << chunkUrl << "\\n";
    }

    void consumeChunk() {
        if (bufferedChunks.empty()) {
            std::cout << "BUFFER UNDERFLOW! Video paused (buffering...)\\n";
            return;
        }
        std::string active = bufferedChunks.front();
        bufferedChunks.erase(bufferedChunks.begin());
        std::cout << "Playing segment: " << active << "\\n";
    }
};`
  }
};

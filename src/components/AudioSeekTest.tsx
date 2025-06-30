import React, { useRef, useState } from "react";

const AudioSeekTest: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const directAudioRef = useRef<HTMLAudioElement>(null);
  const proxyAudioRef = useRef<HTMLAudioElement>(null);

  const addResult = (message: string) => {
    setTestResults((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
  };

  const testDirectAudio = async () => {
    if (!directAudioRef.current) return;

    const audio = directAudioRef.current;
    addResult("Testing direct audio...");

    try {
      // Test seek
      audio.currentTime = 10;
      setTimeout(() => {
        addResult(`Direct seek result: ${audio.currentTime}s (target: 10s)`);
      }, 100);

      // Test play
      await audio.play();
      addResult("Direct audio play successful");
      setTimeout(() => audio.pause(), 2000);
    } catch (error) {
      addResult(`Direct audio error: ${error}`);
    }
  };

  const testProxyAudio = async () => {
    if (!proxyAudioRef.current) return;

    const audio = proxyAudioRef.current;
    addResult("Testing proxy audio...");

    try {
      // Test seek
      audio.currentTime = 10;
      setTimeout(() => {
        addResult(`Proxy seek result: ${audio.currentTime}s (target: 10s)`);
      }, 100);

      // Test play
      await audio.play();
      addResult("Proxy audio play successful");
      setTimeout(() => audio.pause(), 2000);
    } catch (error) {
      addResult(`Proxy audio error: ${error}`);
    }
  };

  const compareHeaders = async () => {
    addResult("Comparing headers...");

    try {
      // Test direct URL headers
      const directResponse = await fetch(
        "/audio/english-conversations-0001-1-at-home-1.mp3",
        {
          method: "HEAD",
        }
      );

      const proxyResponse = await fetch(
        "/api/proxy-audio?url=" +
          encodeURIComponent(
            "/audio/english-conversations-0001-1-at-home-1.mp3"
          ),
        {
          method: "HEAD",
        }
      );

      addResult(
        `Direct Content-Length: ${directResponse.headers.get("content-length")}`
      );
      addResult(
        `Direct Accept-Ranges: ${directResponse.headers.get("accept-ranges")}`
      );
      addResult(
        `Direct Content-Type: ${directResponse.headers.get("content-type")}`
      );

      addResult(
        `Proxy Content-Length: ${proxyResponse.headers.get("content-length")}`
      );
      addResult(
        `Proxy Accept-Ranges: ${proxyResponse.headers.get("accept-ranges")}`
      );
      addResult(
        `Proxy Content-Type: ${proxyResponse.headers.get("content-type")}`
      );
    } catch (error) {
      addResult(`Header comparison error: ${error}`);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        Audio Seek Test - Direct vs Proxy
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Direct Audio */}
        <div className="border rounded p-4">
          <h2 className="text-lg font-semibold mb-2">Direct Audio</h2>
          <audio
            ref={directAudioRef}
            src="/audio/english-conversations-0001-1-at-home-1.mp3"
            controls
            className="w-full mb-2"
          />
          <button
            onClick={testDirectAudio}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Test Direct Audio
          </button>
        </div>

        {/* Proxy Audio */}
        <div className="border rounded p-4">
          <h2 className="text-lg font-semibold mb-2">Proxy Audio</h2>
          <audio
            ref={proxyAudioRef}
            src="/api/proxy-audio?url=/audio/english-conversations-0001-1-at-home-1.mp3"
            controls
            className="w-full mb-2"
          />
          <button
            onClick={testProxyAudio}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Test Proxy Audio
          </button>
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={compareHeaders}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 mb-4"
        >
          Compare Headers
        </button>

        <div className="border rounded p-4 bg-gray-50 max-h-96 overflow-y-auto">
          <h3 className="font-semibold mb-2">Test Results:</h3>
          {testResults.map((result, index) => (
            <div key={index} className="text-sm font-mono mb-1">
              {result}
            </div>
          ))}
          {testResults.length === 0 && (
            <div className="text-gray-500">Chưa có kết quả test nào</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AudioSeekTest;

import os
import sys

# Change dir to back_end
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    print("Testing stt_service...")
    from stt_service import process_audio
    
    # Create a dummy wav file
    import wave
    import struct
    dummy_wav = "dummy.wav"
    with wave.open(dummy_wav, 'wb') as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(16000)
        # Write some silence
        for _ in range(16000):
            wav_file.writeframes(struct.pack('<h', 0))
            
    res = process_audio(dummy_wav)
    print("STT success.")
    print(res)
except Exception as e:
    print("STT failed:")
    import traceback
    traceback.print_exc()

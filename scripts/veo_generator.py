#!/usr/bin/env python3
"""
FORGE - Google DeepMind Veo Video Generator Pipeline
Generates cinematic, photorealistic 60fps exercise demonstration videos using Google Veo (veo-2.0-generate-001).
"""

import os
import sys
import time
import argparse

# Exercise prompts specifically engineered for biomechanically strict calisthenics execution
VEO_PROMPTS = {
    "row": (
        "Cinematic photorealistic 4K slow motion video of an athletic calisthenics athlete performing "
        "strict Australian bodyweight rows on a low horizontal steel bar in a modern dark training gym. "
        "Body is held rigid at a 40-degree incline, chest pulls firmly to touch the bar with scapular retraction, "
        "followed by a slow controlled extension. Dramatic rim lighting, 60fps smooth loop."
    ),
    "plank": (
        "Cinematic photorealistic side-profile video of a fit athlete holding a perfect forearm plank "
        "on a matte rubber gym floor. Forearms flat, elbows under shoulders, pelvis in posterior tilt, "
        "abs and glutes tightly flexed forming an unbroken horizontal line from heels to crown. "
        "Moody studio lighting, subtle controlled breathing, perfectly stable posture."
    ),
    "pushup": (
        "Cinematic slow-motion 4K training video of an athlete performing a strict push-up on a dark floor. "
        "Elbows track at 45 degrees, chest touches the floor, spine rigid like a plank, full lockout at top. "
        "High-contrast sports cinematography, neon orange ambient backlight."
    ),
    "pullup": (
        "Cinematic 4K slow-motion video of a muscular calisthenics athlete executing a dead-hang pull-up "
        "on a high bar in an urban street workout park. Chin clears the bar with zero kipping, full lat flare, "
        "smooth controlled descent back to dead hang. Golden hour cinematic lens flare."
    ),
    "squat": (
        "Cinematic 4K slow-motion demonstration of a deep bodyweight squat. Feet shoulder-width apart, "
        "torso upright, thighs descending below parallel with chest proud, pushing up through heels. "
        "Clean dark gym aesthetic."
    ),
    "dip": (
        "Cinematic slow motion shot of an athlete on parallel dip bars, dipping to 90 degrees with slight forward chest lean, "
        "then driving explosively to full triceps lockout. High detail muscle definition."
    ),
    "muscleup": (
        "Cinematic 4K dramatic slow-motion video of a flawless bar muscle-up on outdoor calisthenics rig. "
        "Powerful explosive chest pull, seamless wrist turnover transition, and crisp triceps press over bar. "
        "Sunset silhouette lighting."
    ),
    "hstand": (
        "Cinematic slow motion video of an athlete holding a straight-line freestanding handstand on floor parallettes. "
        "Shoulders fully open, toes pointed towards ceiling, calm fingertip balance micro-adjustments. "
        "Minimalist aesthetic."
    ),
    "planche": (
        "Cinematic 4K video of a gymnast holding a horizontal full planche above floor parallettes. "
        "Body straight and parallel to ground, protraction of scapulae, zero hip sag. Epic slow motion."
    ),
    "flev": (
        "Cinematic slow motion 4K video of a full front lever hold on high bar. "
        "Body completely horizontal and level with the ground, arms straight, lats fully flared. "
        "Dramatic side angle."
    ),
    "lsit": (
        "Cinematic 4K video of an athlete executing a crisp 90-degree L-sit on wooden parallettes. "
        "Knees locked, toes pointed, shoulders depressed away from ears, trembling core tension."
    ),
    "diamond": (
        "Cinematic 4K close-up of an athlete performing diamond push-ups with hands touching under sternum. "
        "Elbows tucked close to ribs, deep chest depth, and triceps lockout."
    ),
    "pike": (
        "Cinematic slow motion video of an athlete performing pike push-ups. Hips pike high in an inverted V, "
        "head descends forward forming a tripod with hands, pushing overhead to lock out."
    ),
    "hollow": (
        "Cinematic video of an athlete holding a hollow body position on a floor mat. Lower back pressed flat, "
        "arms extended by ears, legs hovering 6 inches off ground in smooth banana shape."
    ),
    "pistol": (
        "Cinematic slow motion demonstration of a single-leg pistol squat. Standing on one leg, non-working leg "
        "held straight out horizontally in front, descending to full rock-bottom depth and standing up with control."
    ),
    "wrist": (
        "Cinematic slow-motion 4K close-up of a calisthenics athlete on hands and knees performing wrist prep mobility routine "
        "on a rubber gym mat. Smooth 360-degree circular rocks over wrists, gentle extension and flexion stretches. Studio rim lighting."
    ),
    "dloc": (
        "Cinematic slow-motion 4K video of an athlete performing shoulder dislocates with a straight wooden dowel stick. "
        "Wide overhand grip, arms held straight, smoothly passing stick from hips overhead and behind back, then reversing forward."
    ),
    "dog": (
        "Cinematic slow-motion 4K video of an athlete performing a Downward-Facing Dog flow on a yoga mat. "
        "Pushing floor away, hips driven high forming an inverted V, straight spine, pedaling heels toward floor to stretch hamstrings."
    )
}

def generate_with_veo(exercise_id, prompt, output_path):
    api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        print(f"[-] GEMINI_API_KEY / GOOGLE_API_KEY not found in environment.")
        print(f"[*] To generate using Google Veo, export your key:")
        print(f"    export GEMINI_API_KEY='your-key-here'")
        print(f"[*] For now, keeping the optimized 60fps biomechanical HD video for '{exercise_id}'.")
        return False

    try:
        from google import genai
        from google.genai import types
        
        print(f"[+] Initializing Google GenAI client with Veo (veo-2.0-generate-001)...")
        client = genai.Client(api_key=api_key)
        
        print(f"[+] Dispatching Veo video generation for '{exercise_id}'...")
        print(f"    Prompt: {prompt[:80]}...")
        
        operation = client.models.generate_videos(
            model="veo-2.0-generate-001",
            prompt=prompt,
            config=types.GenerateVideosConfig(
                aspect_ratio="16:9",
                person_generation="allow_adult",
                number_of_videos=1,
                duration_seconds=5
            )
        )
        
        print("[+] Veo task submitted. Polling for completion...")
        while not operation.done:
            time.sleep(10)
            operation = client.operations.get(operation)
            print("    Still processing video...")

        generated_video = operation.response.generated_videos[0]
        client.files.download(file=generated_video.video, path=output_path)
        print(f"[✔] Successfully downloaded Veo video to: {output_path}")
        return True

    except ImportError:
        print("[-] 'google-genai' package not installed.")
        print("    Run: pip install google-genai")
        return False
    except Exception as e:
        print(f"[-] Veo Generation error: {e}")
        return False

def main():
    parser = argparse.ArgumentParser(description="FORGE Veo Video Generator")
    parser.add_argument("--exercise", type=str, help="Specific exercise ID (e.g. row, plank, pushup)")
    parser.add_argument("--all", action="store_true", help="Generate all exercises")
    args = parser.parse_args()

    out_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../public/videos"))
    os.makedirs(out_dir, exist_ok=True)

    if args.exercise:
        if args.exercise not in VEO_PROMPTS:
            print(f"Unknown exercise: {args.exercise}. Available: {list(VEO_PROMPTS.keys())}")
            sys.exit(1)
        targets = [args.exercise]
    else:
        targets = list(VEO_PROMPTS.keys())

    for ex in targets:
        prompt = VEO_PROMPTS[ex]
        out_file = os.path.join(out_dir, f"{ex}.mp4")
        print(f"\n--- Processing: {ex} ---")
        generate_with_veo(ex, prompt, out_file)

if __name__ == "__main__":
    main()

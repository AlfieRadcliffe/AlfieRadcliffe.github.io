param([string]$Src, [string]$OutDir)
# Splits Alfie's drawing into layers and draws new expressions and arm poses
# in a matching marker style. All layers share the same 565x729 canvas so
# they stack pixel-perfectly.
Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @"
using System; using System.Drawing; using System.Drawing.Drawing2D; using System.Drawing.Imaging;
public static class Frames {
  static Color Ink = Color.FromArgb(255, 0x23, 0x21, 0x26);
  static Random rng = new Random(7);
  static Bitmap Blank(int w, int h) { return new Bitmap(w, h, PixelFormat.Format32bppArgb); }

  // Masks for the parts that change between frames
  static bool InEyes(int x, int y) { return Dist(x, y, 199, 217) < 15 || Dist(x, y, 255, 204) < 15; }
  static bool InMouth(int x, int y) { return x >= 178 && x <= 294 && y >= 240 && y <= 272 && !(Dist(x, y, 180, 243) < 7); }
  static bool InArm(int x, int y) { return x >= 412 && y >= 268 && y <= 410; }
  static double Dist(int x, int y, int cx, int cy) { return Math.Sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy)); }

  static Graphics G(Bitmap b) {
    var g = Graphics.FromImage(b); g.SmoothingMode = SmoothingMode.AntiAlias; g.PixelOffsetMode = PixelOffsetMode.HighQuality; return g;
  }
  // A marker stroke: a slightly wobbly polyline that is thicker in the middle
  // and tapers at the ends, like the original drawing
  static void Stroke(Graphics g, PointF[] pts, float width) {
    var dense = new System.Collections.Generic.List<PointF>();
    for (int i = 0; i < pts.Length - 1; i++) {
      for (int s = 0; s < 8; s++) {
        float t = s / 8f;
        dense.Add(new PointF(pts[i].X + (pts[i + 1].X - pts[i].X) * t + (float)(rng.NextDouble() - .5) * 1.2f,
                             pts[i].Y + (pts[i + 1].Y - pts[i].Y) * t + (float)(rng.NextDouble() - .5) * 1.2f));
      }
    }
    dense.Add(pts[pts.Length - 1]);
    int n = dense.Count;
    for (int i = 0; i < n - 1; i++) {
      double t = (double)i / (n - 1);
      float w = (float)(width * (0.55 + 0.45 * Math.Sin(Math.PI * Math.Min(1, t * 1.15 + .02))));
      using (var p = new Pen(Ink, w)) { p.StartCap = LineCap.Round; p.EndCap = LineCap.Round; g.DrawLine(p, dense[i], dense[i + 1]); }
    }
  }
  static PointF[] Arc(float cx, float cy, float rx, float ry, float a0, float a1, int steps) {
    var pts = new PointF[steps + 1];
    for (int i = 0; i <= steps; i++) {
      double a = (a0 + (a1 - a0) * i / (double)steps) * Math.PI / 180;
      float wob = 1 + (float)(rng.NextDouble() - .5) * .04f;
      pts[i] = new PointF(cx + (float)Math.Cos(a) * rx * wob, cy + (float)Math.Sin(a) * ry * wob);
    }
    return pts;
  }
  static PointF[] P(params float[] xy) { var r = new PointF[xy.Length / 2]; for (int i = 0; i < r.Length; i++) r[i] = new PointF(xy[2 * i], xy[2 * i + 1]); return r; }
  static void Dot(Graphics g, float x, float y, float r) { using (var b = new SolidBrush(Ink)) g.FillEllipse(b, x - r, y - r, 2 * r, 2 * r); }

  public static void Run(string src, string dir) {
    var orig = new Bitmap(src);
    int w = orig.Width, h = orig.Height;
    var bas = Blank(w, h); var faceN = Blank(w, h); var armN = Blank(w, h);
    for (int y = 0; y < h; y++) for (int x = 0; x < w; x++) {
      var c = orig.GetPixel(x, y);
      if (c.A == 0) continue;
      if (InEyes(x, y) || InMouth(x, y)) faceN.SetPixel(x, y, c);
      else if (InArm(x, y)) armN.SetPixel(x, y, c);
      else bas.SetPixel(x, y, c);
    }
    using (var g = G(bas)) Dot(g, 180, 243, 4.6f); // the mole, top-left of the mouth
    bas.Save(dir + "\\base.png", ImageFormat.Png);
    // The original face keeps its own mouth and eyes
    faceN.Save(dir + "\\face-normal.png", ImageFormat.Png);
    armN.Save(dir + "\\arm-down.png", ImageFormat.Png);

    // ---- Faces ----
    var f = Blank(w, h);
    using (var g = G(f)) { Stroke(g, P(186, 219, 199, 221, 212, 217), 8); Stroke(g, P(242, 207, 255, 208, 268, 203), 8); }
    CopyMouth(faceN, f); f.Save(dir + "\\face-blink.png", ImageFormat.Png);

    f = Blank(w, h);
    using (var g = G(f)) {
      Stroke(g, P(186, 224, 199, 208, 212, 222), 8); Stroke(g, P(242, 212, 255, 196, 268, 210), 8);   // ^ ^ eyes
      Stroke(g, P(196, 249, 240, 246, 284, 243), 8);                                                 // top of smile
      Stroke(g, Arc(240, 247, 44, 24, 178, 2, 14), 9);                                               // open grin
    }
    f.Save(dir + "\\face-happy.png", ImageFormat.Png);

    f = Blank(w, h);
    using (var g = G(f)) {
      Dot(g, 199, 216, 8.5f); Dot(g, 255, 203, 8.5f);            // wide eyes
      Stroke(g, Arc(238, 258, 10, 12, 0, 340, 16), 7.5f);        // little "o" mouth
    }
    f.Save(dir + "\\face-surprised.png", ImageFormat.Png);

    f = Blank(w, h);
    using (var g = G(f)) {
      Dot(g, 203, 211, 5.5f); Dot(g, 259, 198, 5.5f);            // eyes glance up
      Stroke(g, P(190, 258, 205, 252, 220, 259, 236, 252, 252, 258, 268, 252, 284, 256), 7.5f); // wobbly "hmm" mouth
    }
    f.Save(dir + "\\face-think.png", ImageFormat.Png);

    // ---- Waving arm (two drawings, swapped for a choppy wave) ----
    // hand centre, inner + outer elbow corners, wrist angles on the hand circle
    Wave(w, h, 472, 196, 442, 302, 476, 342, 115, 62, dir + "\\arm-wave-1.png");
    Wave(w, h, 508, 210, 452, 304, 488, 344, 122, 70, dir + "\\arm-wave-2.png");
  }

  static void CopyMouth(Bitmap from, Bitmap to) {
    for (int y = 240; y <= 272; y++) for (int x = 178; x <= 294; x++) { var c = from.GetPixel(x, y); if (c.A > 0) to.SetPixel(x, y, c); }
  }

  // Arm comes out of the sleeve sideways, bends at the elbow and goes up to a
  // round mitten hand, like the hands in the original drawing
  static void Wave(int w, int h, float hx, float hy, float inX, float inY, float outX, float outY, float wristIn, float wristOut, string path) {
    const float R = 44;
    var b = Blank(w, h);
    using (var g = G(b)) {
      float wix = hx + R * (float)Math.Cos(wristIn * Math.PI / 180), wiy = hy + R * (float)Math.Sin(wristIn * Math.PI / 180);
      float wox = hx + R * (float)Math.Cos(wristOut * Math.PI / 180), woy = hy + R * (float)Math.Sin(wristOut * Math.PI / 180);
      Stroke(g, P(410, 302, inX, inY, wix, wiy), 9);    // inner edge of the arm
      Stroke(g, P(400, 352, outX, outY, wox, woy), 9);  // outer edge of the arm
      // hand circle drawn the long way round, leaving a gap where the wrist joins
      float start = wristIn, end = wristOut;
      while (end <= start) end += 360;
      Stroke(g, Arc(hx, hy, R + 1, R, start, end, 30), 9);
    }
    b.Save(path, ImageFormat.Png);
  }
}
"@
New-Item -ItemType Directory -Force $OutDir | Out-Null
[Frames]::Run($Src, $OutDir)
Get-ChildItem $OutDir | Select-Object Name, Length

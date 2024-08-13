$source = @"
using System;
using System.Runtime.InteropServices;

namespace DesktopUtility
{
    class Win32Functions
    {
        [DllImport("user32.dll")]
        public static extern IntPtr FindWindow(string lpClassName, string lpWindowName);
        [DllImport("user32.dll")]
        public static extern IntPtr FindWindowEx(IntPtr hwndParent, IntPtr hwndChildAfter, string lpszClass, string lpszWindow);
        [DllImport("user32.dll")]
        public static extern IntPtr GetDesktopWindow();
        [DllImport("user32.dll")]
        public static extern IntPtr SendMessage(IntPtr hWnd, uint Msg, IntPtr wParam, IntPtr lParam);
    }

    public class Desktop
    {
        public static IntPtr GetHandle()
        {
            IntPtr hDesktopWin = Win32Functions.GetDesktopWindow();
            IntPtr hProgman = Win32Functions.FindWindow("Progman", "Program Manager");
            IntPtr hWorkerW = IntPtr.Zero;

            IntPtr hShellViewWin = Win32Functions.FindWindowEx(hProgman, IntPtr.Zero, "SHELLDLL_DefView", "");
            if (hShellViewWin == IntPtr.Zero)
            {
                do
                {
                    hWorkerW = Win32Functions.FindWindowEx(hDesktopWin, hWorkerW, "WorkerW", "");
                    hShellViewWin = Win32Functions.FindWindowEx(hWorkerW, IntPtr.Zero, "SHELLDLL_DefView", "");
                } while (hShellViewWin == IntPtr.Zero && hWorkerW != null);
            }
            return hShellViewWin;
        }

        public static void ToggleDesktopIcons()
        {
            Win32Functions.SendMessage(Desktop.GetHandle(), 0x0111, (IntPtr)0x7402, (IntPtr)0);
        }
    }
}
"@

Add-Type -TypeDefinition $source

[DesktopUtility.Desktop]::ToggleDesktopIcons()
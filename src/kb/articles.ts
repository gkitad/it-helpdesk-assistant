// Knowledge base used for retrieval. Each article is a Tier 1 runbook:
// what the user sees, what to try, and when to hand it to someone else.
// Add or edit articles here; retrieval picks them up automatically.

export type Category =
  | "Accounts & access"
  | "Email & collaboration"
  | "Network & VPN"
  | "Hardware & peripherals"
  | "Performance & OS"
  | "Security";

export type Article = {
  id: string;
  title: string;
  category: Category;
  symptoms: string;
  steps: string[];
  escalateWhen: string;
};

export const articles: Article[] = [
  {
    id: "KB001",
    title: "Account locked out after failed sign-ins",
    category: "Accounts & access",
    symptoms:
      "User cannot log in, account locked, too many attempts, password not accepted, locked out of Windows or Microsoft 365.",
    steps: [
      "Confirm the user's identity using your verification policy before touching the account.",
      "Check whether a phone, tablet or mapped drive is still using an old password and retrying in the background — this is the most common cause of repeat lockouts.",
      "Unlock the account in Active Directory or the Entra admin center.",
      "If the password expired, start a reset through self-service password reset or reset it with must-change-at-next-sign-in enabled.",
      "Have the user sign out of every device and sign back in with the new password.",
    ],
    escalateWhen:
      "The account locks again within minutes of unlocking with no stale device found, or sign-in logs show attempts from unfamiliar locations (escalate to Security).",
  },
  {
    id: "KB002",
    title: "MFA prompt not arriving or new phone",
    category: "Accounts & access",
    symptoms:
      "Authenticator app not getting push notifications, MFA code rejected, got a new phone, lost phone, cannot approve sign-in, two-factor.",
    steps: [
      "Verify the user's identity before changing any authentication method.",
      "Ask the user to check that the phone's date and time are set automatically — codes fail when the clock drifts.",
      "Have them open the authenticator app directly, pull to refresh, and approve any pending request.",
      "For a new or lost phone, require re-registration of MFA methods in the admin center and walk them through setting up the app again.",
      "If the old phone was lost, sign the user out of all sessions.",
    ],
    escalateWhen:
      "The user reports MFA prompts they did not trigger — treat as a possible compromised password and escalate to Security immediately.",
  },
  {
    id: "KB003",
    title: "VPN won't connect",
    category: "Network & VPN",
    symptoms:
      "VPN client fails to connect, stuck connecting, authentication failed, cannot reach internal sites from home, remote access not working.",
    steps: [
      "Confirm the computer has working internet without the VPN by opening a public website.",
      "Restart the VPN client completely, or reboot if it was left running across sleep.",
      "Check the clock and time zone — certificate-based VPNs fail when the time is wrong.",
      "If on hotel, airport or public Wi-Fi, accept the captive portal page first, then try again; try a phone hotspot to rule out the network.",
      "Make sure the client is on the current version and the user's password has not just expired.",
    ],
    escalateWhen:
      "Several users report the same failure at once, or the client logs show certificate or gateway errors after the steps above (escalate to the Network team).",
  },
  {
    id: "KB004",
    title: "Wi-Fi connected but no internet",
    category: "Network & VPN",
    symptoms:
      "Wi-Fi shows connected but pages won't load, no internet access, limited connectivity, DNS errors, network drops in the office.",
    steps: [
      "Check whether other devices on the same Wi-Fi work, to tell a device problem from a network problem.",
      "Forget the network and reconnect, re-entering credentials.",
      "Run ipconfig /release, ipconfig /renew and ipconfig /flushdns from an elevated command prompt.",
      "Disable and re-enable the wireless adapter, then update its driver if it's out of date.",
      "Try a wired connection to confirm the laptop itself can reach the network.",
    ],
    escalateWhen:
      "A whole area or floor has no connectivity, or the device gets no IP address on a wired connection (escalate to the Network team).",
  },
  {
    id: "KB005",
    title: "Outlook crashes, freezes or won't open",
    category: "Email & collaboration",
    symptoms:
      "Outlook not responding, crashes on startup, stuck loading profile, keeps freezing, email client won't open.",
    steps: [
      "Close Outlook fully and confirm in Task Manager that no OUTLOOK.EXE process is left running.",
      "Start Outlook in safe mode (outlook.exe /safe). If it opens, disable add-ins one at a time to find the culprit.",
      "Run a Quick Repair of Microsoft 365 from Apps & features, then an Online Repair if the problem persists.",
      "Create a new Outlook profile from Control Panel > Mail and set it as the default.",
      "Check free disk space — a full drive can stop the mailbox cache from opening.",
    ],
    escalateWhen:
      "Outlook on the web also fails for the user, which points to the mailbox rather than the computer (escalate to Tier 2 / Messaging).",
  },
  {
    id: "KB006",
    title: "Emails not sending or receiving",
    category: "Email & collaboration",
    symptoms:
      "Emails stuck in outbox, not receiving mail, bounced message, undeliverable, mailbox full, email delayed.",
    steps: [
      "Check whether Outlook shows Working Offline or Disconnected in the status bar and reconnect.",
      "Test with Outlook on the web to tell a client problem from a mailbox problem.",
      "Check mailbox size against quota and help the user archive or empty Deleted Items if it's full.",
      "Read the bounce message: a wrong address, a blocked recipient domain or an oversized attachment each has a different fix.",
      "Remove large attachments from stuck messages and resend using a shared link instead.",
    ],
    escalateWhen:
      "Mail to or from an entire domain is failing, or the user's sent mail is being rejected as spam (escalate to Tier 2 / Messaging).",
  },
  {
    id: "KB007",
    title: "Teams audio, camera or screen share not working",
    category: "Email & collaboration",
    symptoms:
      "Others can't hear me in Teams, microphone not working, camera black, no sound in meetings, screen share fails, headset not detected.",
    steps: [
      "In Teams, open Settings > Devices and confirm the right speaker, microphone and camera are selected.",
      "Check Windows privacy settings allow microphone and camera access for desktop apps.",
      "Unplug and reconnect the headset or dock, then make a test call from Teams settings.",
      "Close other apps that may hold the camera, like Zoom or the Camera app.",
      "Clear the Teams cache by quitting Teams and restarting it, or sign out and back in.",
    ],
    escalateWhen:
      "The device isn't detected by Windows at all after trying another USB port (treat as hardware), or the issue affects every user in a meeting room.",
  },
  {
    id: "KB008",
    title: "OneDrive not syncing",
    category: "Email & collaboration",
    symptoms:
      "OneDrive sync pending, files not uploading, red X on files, sync error, SharePoint library not updating, file locked.",
    steps: [
      "Click the OneDrive cloud icon to read the exact error before changing anything.",
      "Pause and resume sync, then sign out and back in to OneDrive if it stays stuck.",
      "Check for file names with unsupported characters or paths over 400 characters and rename them.",
      "Confirm the user has free space in OneDrive and on the local drive.",
      "Reset OneDrive with onedrive.exe /reset if the client is unresponsive.",
    ],
    escalateWhen:
      "Files appear to be missing or overwritten — stop and escalate to Tier 2 before any reset so version history can be recovered.",
  },
  {
    id: "KB009",
    title: "Printer not printing",
    category: "Hardware & peripherals",
    symptoms:
      "Print job stuck in queue, printer offline, nothing comes out, printer not found, wrong printer, cannot add printer.",
    steps: [
      "Check the printer's own panel for paper jams, empty trays or toner warnings.",
      "Confirm the computer is printing to the right printer and that it isn't set to Use Printer Offline.",
      "Clear stuck jobs from the queue; if they won't clear, restart the Print Spooler service.",
      "Remove and re-add the printer from the print server or the approved list.",
      "Print a test page from the printer itself to rule out the device.",
    ],
    escalateWhen:
      "No one can print to the device, it shows a hardware error code, or it's unreachable on the network (escalate to Tier 2 or the print vendor).",
  },
  {
    id: "KB010",
    title: "External monitors or dock not detected",
    category: "Hardware & peripherals",
    symptoms:
      "Second monitor not working, docking station not detected, no signal, display flickering, USB-C dock keyboard and mouse not working.",
    steps: [
      "Reseat the dock's connection to the laptop and confirm the dock has power.",
      "Press Windows+P and choose Extend; then check Display settings > Detect.",
      "Swap the cable or port to rule out a bad cable.",
      "Update the dock firmware and graphics driver using the vendor's update tool.",
      "Fully shut down the laptop (not restart), disconnect the dock for 30 seconds, then reconnect and power on.",
    ],
    escalateWhen:
      "The dock fails with a second known-good laptop, or the monitor shows no signal with a direct cable (replace hardware).",
  },
  {
    id: "KB011",
    title: "Computer running slow",
    category: "Performance & OS",
    symptoms:
      "Laptop very slow, freezing, high CPU, high memory, takes forever to boot, apps lagging, fan loud.",
    steps: [
      "Ask when it started and whether anything changed — a new app, an update or a full disk.",
      "Restart the computer; many slowness tickets come from machines not rebooted in weeks.",
      "Open Task Manager and sort by CPU, memory and disk to find the process responsible.",
      "Free disk space if the system drive is above 90% full, and remove startup apps the user doesn't need.",
      "Make sure pending Windows updates are installed and the endpoint protection scan is not running.",
    ],
    escalateWhen:
      "The disk shows SMART errors, the machine is past its refresh date, or a security tool flags an unknown process (escalate to Security).",
  },
  {
    id: "KB012",
    title: "Windows update stuck or failing",
    category: "Performance & OS",
    symptoms:
      "Windows update failed, stuck at a percentage, update error code, restart loop after update, pending restart.",
    steps: [
      "Write down the exact error code from Settings > Windows Update > Update history.",
      "Restart the computer and let the update retry; leave it on power and connected to the network.",
      "Run the Windows Update troubleshooter.",
      "Check that there is enough free disk space for the update.",
      "Run sfc /scannow and DISM /Online /Cleanup-Image /RestoreHealth from an elevated prompt.",
    ],
    escalateWhen:
      "The machine boot-loops or won't start after an update (escalate to Tier 2 for recovery or reimage).",
  },
  {
    id: "KB013",
    title: "BitLocker recovery key prompt",
    category: "Security",
    symptoms:
      "BitLocker recovery screen at startup, asks for recovery key, drive locked, 48-digit key.",
    steps: [
      "Verify the user's identity before giving out any recovery key.",
      "Look up the key in Entra ID, Intune or Active Directory using the key ID shown on the screen.",
      "Read the key to the user over a verified channel and have them enter it.",
      "Once in, ask what changed — BIOS update, dock or hardware change — since those commonly trigger the prompt.",
    ],
    escalateWhen:
      "No recovery key is on file for the device, or the prompt keeps returning after every reboot (escalate to Tier 2).",
  },
  {
    id: "KB014",
    title: "Suspicious email or possible phishing",
    category: "Security",
    symptoms:
      "Suspicious email, phishing, clicked a link, entered password on a fake page, opened an attachment, strange sender, gift card request from boss.",
    steps: [
      "If the user only received it: have them report it with the Report Phishing button and delete it without clicking anything.",
      "If they clicked a link or entered credentials: disconnect the device from the network and reset their password right away.",
      "Revoke the user's active sessions and check MFA methods for anything they didn't add.",
      "Note the time, the sender and what the user did, for the security team.",
    ],
    escalateWhen:
      "Always escalate to Security when the user clicked, entered credentials or opened an attachment — this is a P1 regardless of how calm the user is.",
  },
  {
    id: "KB015",
    title: "Shared or mapped drive not accessible",
    category: "Accounts & access",
    symptoms:
      "Mapped drive missing, network drive red X, access denied to shared folder, cannot open file share, permission denied.",
    steps: [
      "Confirm the user is on the office network or connected to VPN.",
      "Try opening the share by its full path (\\\\server\\share) to tell a mapping issue from a permissions issue.",
      "Reconnect the drive or run gpupdate /force and sign out and back in.",
      "If access is denied, confirm with the folder owner or manager that the user should have access before requesting it.",
    ],
    escalateWhen:
      "Access needs to be granted (submit an access request to the owner's approval process), or the server is down for everyone (escalate to Tier 2 / Infrastructure).",
  },
];

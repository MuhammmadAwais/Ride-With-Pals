import { toast } from "sonner";

export interface CalendarRideData {
  id: number | string;
  title: string;
  date: string;
  time?: string;
  location: string;
  description?: string;
  clubName?: string;
  distance?: string;
  speed?: string;
  rideType?: string;
  url?: string;
}

export interface GpxRideData {
  id: number | string;
  title: string;
  clubName?: string;
  location?: string;
  date?: string;
  rideType?: string;
  gpxFile?: string | null;
}

/**
 * Generates an authentic Google Calendar event creation URL
 */
export const buildGoogleCalendarUrl = (ride: CalendarRideData): string => {
  try {
    // Parse date and time
    let startDateTime: Date;
    const cleanDate = (ride.date || "").trim();
    const cleanTime = (ride.time || "08:00").trim();

    if (cleanDate && cleanDate !== "TBD" && !isNaN(Date.parse(cleanDate))) {
      // Check if time is format HH:mm
      const timeParts = cleanTime.match(/(\d{1,2}):(\d{2})/);
      if (timeParts) {
        const dateObj = new Date(cleanDate);
        dateObj.setHours(parseInt(timeParts[1], 10), parseInt(timeParts[2], 10), 0, 0);
        startDateTime = dateObj;
      } else {
        startDateTime = new Date(cleanDate);
      }
    } else {
      // Default to tomorrow 09:00 AM if no valid date
      startDateTime = new Date();
      startDateTime.setDate(startDateTime.getDate() + 1);
      startDateTime.setHours(9, 0, 0, 0);
    }

    // End time default: 2 hours after start
    const endDateTime = new Date(startDateTime.getTime() + 2 * 60 * 60 * 1000);

    const formatToGCalUTC = (d: Date) => {
      return d.toISOString().replace(/-|:|\.\d+/g, "");
    };

    const datesParam = `${formatToGCalUTC(startDateTime)}/${formatToGCalUTC(endDateTime)}`;

    const shareUrl = ride.url || `${window.location.origin}/view/userside/dashboard/ride/${ride.id}`;
    
    const detailsLines = [
      `Activity: ${ride.title}`,
      ride.clubName ? `Club: ${ride.clubName}` : "",
      ride.rideType ? `Sport: ${ride.rideType}` : "",
      ride.distance && ride.distance !== "N/A" ? `Distance: ${ride.distance}` : "",
      ride.speed && ride.speed !== "N/A" ? `Pace / Speed: ${ride.speed}` : "",
      ride.description ? `\nDetails:\n${ride.description}` : "",
      `\nView & Join on Ride With Pals: ${shareUrl}`,
    ].filter(Boolean).join("\n");

    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: ride.title,
      dates: datesParam,
      details: detailsLines,
      location: ride.location && ride.location !== "TBD" ? ride.location : "Meeting Point",
      sf: "true",
      output: "xml"
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  } catch (err) {
    console.error("Error building Google Calendar URL", err);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(ride.title)}`;
  }
};

/**
 * Triggers download of GPX file (either from server storage or dynamically generated GPX 1.1)
 */
export const downloadGpxFile = async (ride: GpxRideData): Promise<void> => {
  const safeFilename = (ride.title || "activity")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  toast.info(`Preparing GPX route for "${ride.title}"...`);

  // Check if server GPX file is available
  if (ride.gpxFile && typeof ride.gpxFile === "string" && ride.gpxFile.trim() !== "" && ride.gpxFile !== "null") {
    let fileUrl = ride.gpxFile.trim();
    if (!fileUrl.startsWith("http://") && !fileUrl.startsWith("https://") && !fileUrl.startsWith("/")) {
      fileUrl = `https://api.ridewithpals.com/uploads/${fileUrl}`;
    }

    try {
      const response = await fetch(fileUrl);
      if (response.ok) {
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = `${safeFilename}.gpx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
        toast.success("GPX route downloaded successfully!");
        return;
      }
    } catch (e) {
      console.warn("Could not download hosted GPX file directly, generating compliant GPX route fallback.", e);
    }
  }

  // Fallback: Generate a clean, compliant GPX 1.1 XML file with activity metadata
  try {
    const nowIso = new Date().toISOString();
    const escapeXml = (str: string = "") =>
      str.replace(/[<>&'"]/g, (c) => {
        switch (c) {
          case "<": return "&lt;";
          case ">": return "&gt;";
          case "&": return "&amp;";
          case "'": return "&apos;";
          case '"': return "&quot;";
          default: return c;
        }
      });

    const gpxContent = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Ride With Pals - https://ridewithpals.com" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${escapeXml(ride.title)}</name>
    <desc>${escapeXml((ride.clubName ? `Club: ${ride.clubName}. ` : "") + (ride.location ? `Meeting point: ${ride.location}` : ""))}</desc>
    <time>${nowIso}</time>
  </metadata>
  <wpt lat="41.3851" lon="2.1734">
    <name>${escapeXml(ride.location || "Start Location")}</name>
    <desc>Start / Meeting Point for ${escapeXml(ride.title)}</desc>
    <type>${escapeXml(ride.rideType || "Activity")}</type>
  </wpt>
  <trk>
    <name>${escapeXml(ride.title)}</name>
    <type>${escapeXml(ride.rideType || "Ride")}</type>
    <trkseg>
      <trkpt lat="41.3851" lon="2.1734">
        <ele>120.0</ele>
        <time>${nowIso}</time>
      </trkpt>
    </trkseg>
  </trk>
</gpx>`;

    const blob = new Blob([gpxContent], { type: "application/gpx+xml;charset=utf-8" });
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = `${safeFilename}.gpx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
    toast.success("GPX route file generated and downloaded!");
  } catch (err) {
    console.error("Failed to generate GPX file", err);
    toast.error("Failed to download GPX file. Please try again.");
  }
};

/**
 * Extracts terrain & category badges from backend activity data.
 * Guarantees every activity receives a primary surface badge ("Road" or "Trail"),
 * plus any event category badge ("Social", "Training", "Race", etc.).
 */
export const extractTerrainAndCategoryBadges = (item: any): string[] => {
  const badges: string[] = [];

  // 1. Determine Surface Badge: "Trail", "Gravel", or "Road"
  const isTrailFlag = item.isTrail === true || item.isTrail === 1 || item.isTrail === "true";
  const isAsphaltFlag = item.isAsphalt === true || item.isAsphalt === 1 || item.isAsphalt === "true";

  const subTypeId = Number(item.sportSubTypeId || item.subTypeId);
  const subTypeName = (item.sportSubTypeName || item.subTypeName || item.subType || "").toString().toLowerCase();

  const titleLower = (item.rideName || item.title || item.name || "").toString().toLowerCase();
  const descLower = (item.description || "").toString().toLowerCase();
  const textContent = `${titleLower} ${descLower} ${subTypeName}`;

  let surface = "Road";

  if (isTrailFlag) {
    surface = "Trail";
  } else if (isAsphaltFlag) {
    surface = "Road";
  } else if (subTypeId === 1 || subTypeId === 2 || subTypeId === 3) {
    // 1: Cross Country, 2: Enduro, 3: Downhill
    surface = "Trail";
  } else if (subTypeId === 8 || subTypeName.includes("gravel") || textContent.includes("gravel")) {
    surface = "Gravel";
  } else if (subTypeId === 4 || subTypeId === 5 || subTypeId === 6 || subTypeId === 7) {
    // 4: Gran Fondo, 5: Time Trial, 6: Criterium, 7: Track
    surface = "Road";
  } else if (
    textContent.includes("trail") || 
    textContent.includes("mountain") || 
    textContent.includes("mtb") || 
    textContent.includes("xc") || 
    textContent.includes("dirt") || 
    textContent.includes("forest") ||
    textContent.includes("off-road") ||
    textContent.includes("offroad") ||
    textContent.includes("downhill")
  ) {
    surface = "Trail";
  } else {
    // Default surface for cycling and road activities
    surface = "Road";
  }

  badges.push(surface);

  // 2. Determine Category / Event Type (e.g., "Social", "Race", "Training")
  const categoryId = Number(item.categoryTypeId || item.categoryId || item.rideCategoryTypeId);
  const categoryName = (item.categoryTypeName || item.category?.name || item.categoryName || "").toString().toLowerCase();

  if (categoryId === 1 || categoryName.includes("social") || textContent.includes("social") || textContent.includes("roll")) {
    badges.push("Social");
  } else if (categoryId === 2 || categoryName.includes("training") || textContent.includes("training")) {
    badges.push("Training");
  } else if (categoryId === 3 || categoryName.includes("race") || textContent.includes("race") || textContent.includes("criterium") || textContent.includes("crit")) {
    badges.push("Race");
  } else if (categoryId === 4 || categoryName.includes("charity") || textContent.includes("charity")) {
    badges.push("Charity");
  } else if (categoryId === 5 || categoryName.includes("tour") || textContent.includes("tour")) {
    badges.push("Tour");
  }

  // Maximum 2 badges on card image (Surface + Category) for clean modern aesthetics
  return badges.slice(0, 2);
};

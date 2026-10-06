"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, Bookmark, Rocket, Sparkles, Trophy, Wrench, X } from "@/components/icons";

type NotificationCategory = "all" | "updates" | "releases" | "achievements";

type NotificationItem = {
  id: string;
  type: "release" | "achievement" | "update" | "recommendation" | "wishlist";
  category: "updates" | "releases" | "achievements";
  title: string;
  description: string;
  time: string;
  link: string;
  icon: typeof Rocket;
  iconColor: string;
  unread: boolean;
};

const initialNotifications: NotificationItem[] = [
  {
    id: "notif-1",
    type: "release",
    category: "releases",
    title: "New Release",
    description: "Silent Hill 2 releases in 3 days",
    time: "2h ago",
    link: "/game/silent-hill-2",
    icon: Rocket,
    iconColor: "#f97316",
    unread: true,
  },
  {
    id: "notif-2",
    type: "achievement",
    category: "achievements",
    title: "Achievement",
    description: "You earned 'Dedicated' in Marvel's Spider-Man 2",
    time: "5h ago",
    link: "/game/marvels-spider-man-2",
    icon: Trophy,
    iconColor: "#eab308",
    unread: true,
  },
  {
    id: "notif-3",
    type: "update",
    category: "updates",
    title: "Game Update",
    description: "Cyberpunk 2077 Patch 2.2 is now available",
    time: "1d ago",
    link: "/game/cyberpunk-2077",
    icon: Wrench,
    iconColor: "#a3e635",
    unread: false,
  },
  {
    id: "notif-4",
    type: "recommendation",
    category: "updates",
    title: "Recommendation",
    description: "Based on your library, you might like Alan Wake 2",
    time: "2d ago",
    link: "/game/alan-wake-2",
    icon: Sparkles,
    iconColor: "#a855f7",
    unread: false,
  },
  {
    id: "notif-5",
    type: "wishlist",
    category: "releases",
    title: "Wishlist",
    description: "Dragon Quest III HD-2D Remake is now available",
    time: "3d ago",
    link: "/game/dragon-quest-iii-hd-2d-remake",
    icon: Bookmark,
    iconColor: "#10b981",
    unread: false,
  },
];

export function NotificationMenu() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<NotificationCategory>("all");
  const [notifications] = useState<NotificationItem[]>(initialNotifications);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: PointerEvent) {
      if (event.target instanceof Node && !menuRef.current?.contains(event.target)) setOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const filteredNotifications = notifications.filter((item) => {
    if (activeTab === "all") return true;
    return item.category === activeTab;
  });

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <div className="notification-menu" ref={menuRef}>
      <button
        className="icon-action-btn notification-trigger"
        type="button"
        aria-label="Notifications"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <Bell size={18} aria-hidden="true" />
        {unreadCount > 0 && <span className="notification-badge-dot" />}
      </button>

      {open && (
        <section
          className="notification-popover"
          id="gamehub-notifications"
          role="dialog"
          aria-labelledby="gamehub-notifications-title"
        >
          <div className="notification-popover-heading">
            <h2 id="gamehub-notifications-title">Notifications</h2>
            <button
              type="button"
              className="notification-close"
              aria-label="Close notifications"
              onClick={() => setOpen(false)}
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="notification-tabs">
            {(["all", "updates", "releases", "achievements"] as NotificationCategory[]).map((tab) => (
              <button
                key={tab}
                type="button"
                className={`notif-tab-btn ${activeTab === tab ? "notif-tab-active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Notifications List */}
          <div className="notification-list">
            {filteredNotifications.length === 0 ? (
              <div className="notification-empty">
                <p>No notifications in this category</p>
              </div>
            ) : (
              filteredNotifications.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.id}
                    href={item.link}
                    className={`notification-item ${item.unread ? "notif-unread" : ""}`}
                    onClick={() => setOpen(false)}
                  >
                    <div
                      className="notif-icon-box"
                      style={{ color: item.iconColor, backgroundColor: `${item.iconColor}18` }}
                    >
                      <IconComponent size={16} />
                    </div>
                    <div className="notif-content">
                      <div className="notif-item-header">
                        <span className="notif-type-tag">{item.title}</span>
                        <span className="notif-time">{item.time}</span>
                      </div>
                      <p className="notif-description">{item.description}</p>
                    </div>
                  </Link>
                );
              })
            )}
          </div>

          <div className="notification-footer">
            <Link
              href="/upcoming"
              className="notif-view-all"
              onClick={() => setOpen(false)}
            >
              View All Notifications
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}

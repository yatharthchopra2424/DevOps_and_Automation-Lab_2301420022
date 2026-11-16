"""Feature Flags module — Lab 3 DevOps
Student ID: 2301420022
"""


class FeatureFlags:
    """Simple in-memory feature flag store."""

    def __init__(self, initial_flags: dict | None = None):
        self._flags: dict[str, bool] = {}
        if initial_flags:
            for key, value in initial_flags.items():
                self._flags[str(key)] = bool(value)

    # --- mutation --------------------------------------------------------

    def enable(self, flag: str) -> None:
        """Enable a feature flag (creates it if absent)."""
        self._flags[flag] = True

    def disable(self, flag: str) -> None:
        """Disable a feature flag (creates it if absent)."""
        self._flags[flag] = False

    def set(self, flag: str, value: bool) -> None:
        """Set a flag to an explicit boolean value."""
        self._flags[flag] = bool(value)

    def toggle(self, flag: str) -> bool:
        """Toggle a flag and return the new state."""
        new_state = not self._flags.get(flag, False)
        self._flags[flag] = new_state
        return new_state

    def remove(self, flag: str) -> None:
        """Remove a flag entirely."""
        self._flags.pop(flag, None)

    # --- query -----------------------------------------------------------

    def is_enabled(self, flag: str) -> bool:
        """Return True if the flag exists and is enabled."""
        return self._flags.get(flag, False)

    def all_flags(self) -> dict:
        """Return a copy of all flags and their current state."""
        return dict(self._flags)

    def __repr__(self) -> str:
        return f"FeatureFlags({self._flags})"


# ---------------------------------------------------------------------------
# Default instance used by the Flask app
# ---------------------------------------------------------------------------
flags = FeatureFlags({
    "dark_mode": False,
    "beta_ui": False,
    "new_dashboard": False,
    "export_pdf": True,
})

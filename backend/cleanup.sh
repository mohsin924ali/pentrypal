#!/bin/bash

# PentryPal Database Cleanup Script Wrapper
# Makes it easy to run common cleanup operations

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLEANUP_SCRIPT="$SCRIPT_DIR/database_cleanup.py"
CONFIG_FILE="$SCRIPT_DIR/cleanup_config.json"

# Check if Python script exists
if [[ ! -f "$CLEANUP_SCRIPT" ]]; then
    echo -e "${RED}Error: database_cleanup.py not found in $SCRIPT_DIR${NC}"
    exit 1
fi

# Function to show usage
show_usage() {
    echo -e "${BLUE}PentryPal Database Cleanup Helper${NC}"
    echo ""
    echo "Usage: $0 [command] [options]"
    echo ""
    echo -e "${GREEN}Commands:${NC}"
    echo "  dry-run           Show what would be cleaned (safe)"
    echo "  cleanup           Perform full cleanup with confirmation"
    echo "  force-cleanup     Perform cleanup without confirmation"
    echo "  expired           Clean only expired data"
    echo "  orphaned          Clean only orphaned records"
    echo "  activity          Clean only activity logs"
    echo "  test-data         Remove test data"
    echo "  optimize          Optimize database only"
    echo "  size              Show current database sizes"
    echo "  help              Show this help message"
    echo ""
    echo -e "${GREEN}Options:${NC}"
    echo "  --days N          Override retention days"
    echo "  --config FILE     Use custom config file"
    echo "  --debug           Enable debug logging"
    echo ""
    echo -e "${GREEN}Examples:${NC}"
    echo "  $0 dry-run                    # Safe preview of all cleanup"
    echo "  $0 cleanup --days 30          # Cleanup with 30-day retention"
    echo "  $0 expired --debug            # Clean expired data with debug logs"
    echo "  $0 test-data --config custom.json  # Remove test data with custom config"
}

# Function to run Python cleanup script
run_cleanup() {
    local operation="$1"
    shift
    local args=("$@")
    
    echo -e "${BLUE}Running database cleanup: $operation${NC}"
    
    # Build command
    local cmd=("python3" "$CLEANUP_SCRIPT")
    
    if [[ "$operation" != "all" && "$operation" != "force" ]]; then
        cmd+=(--operation "$operation")
    fi
    
    if [[ "$operation" == "dry-run" ]]; then
        cmd+=(--dry-run)
    elif [[ "$operation" == "force" ]]; then
        cmd+=(--force)
    fi
    
    # Add additional arguments
    cmd+=("${args[@]}")
    
    # Add config file if it exists and wasn't specified
    local has_config=false
    for arg in "${args[@]}"; do
        if [[ "$arg" == "--config-file" || "$arg" == "--config" ]]; then
            has_config=true
            break
        fi
    done
    
    if [[ "$has_config" == false && -f "$CONFIG_FILE" ]]; then
        cmd+=(--config-file "$CONFIG_FILE")
    fi
    
    echo -e "${YELLOW}Command: ${cmd[*]}${NC}"
    echo ""
    
    # Execute command
    "${cmd[@]}"
}

# Function to show database sizes
show_size() {
    echo -e "${BLUE}Current Database Sizes${NC}"
    run_cleanup "dry-run" "$@" | grep -A 20 "DATABASE SIZE BY TABLE:" || true
}

# Parse command line arguments
if [[ $# -eq 0 ]]; then
    show_usage
    exit 0
fi

COMMAND="$1"
shift

# Handle options that might be passed as first argument
case "$COMMAND" in
    --help|-h|help)
        show_usage
        exit 0
        ;;
esac

# Process remaining arguments
ARGS=()
while [[ $# -gt 0 ]]; do
    case $1 in
        --days)
            ARGS+=(--days-to-keep "$2")
            shift 2
            ;;
        --config)
            ARGS+=(--config-file "$2")
            shift 2
            ;;
        --debug)
            ARGS+=(--log-level DEBUG)
            shift
            ;;
        *)
            ARGS+=("$1")
            shift
            ;;
    esac
done

# Execute command
case "$COMMAND" in
    dry-run|dryrun)
        run_cleanup "dry-run" "${ARGS[@]}"
        ;;
    cleanup|clean)
        echo -e "${YELLOW}This will perform database cleanup operations.${NC}"
        echo -e "${YELLOW}Make sure you have a recent backup!${NC}"
        echo ""
        read -p "Continue? (y/N): " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            run_cleanup "all" "${ARGS[@]}"
        else
            echo "Cancelled."
            exit 0
        fi
        ;;
    force-cleanup|force)
        echo -e "${RED}WARNING: Running cleanup without confirmation!${NC}"
        run_cleanup "force" "${ARGS[@]}"
        ;;
    expired)
        run_cleanup "expired" "${ARGS[@]}"
        ;;
    orphaned)
        run_cleanup "orphaned" "${ARGS[@]}"
        ;;
    activity)
        run_cleanup "activity" "${ARGS[@]}"
        ;;
    test-data|testdata)
        echo -e "${YELLOW}WARNING: This will remove test users and ALL related data!${NC}"
        echo -e "${YELLOW}Make sure your test patterns are correct!${NC}"
        echo ""
        run_cleanup "test-data" "${ARGS[@]}"
        ;;
    optimize)
        run_cleanup "optimize" "${ARGS[@]}"
        ;;
    size|sizes)
        show_size "${ARGS[@]}"
        ;;
    *)
        echo -e "${RED}Unknown command: $COMMAND${NC}"
        echo ""
        show_usage
        exit 1
        ;;
esac

echo -e "${GREEN}Operation completed successfully!${NC}"

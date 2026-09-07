package com.example.restaurant.dto.kot;

public class KotStatsDto {
    private long totalToday;
    private long activeTickets;
    private long preparingTickets;
    private long readyTickets;
    private long delayedTickets; // > 15 mins

    public KotStatsDto() {
    }

    public KotStatsDto(long totalToday, long activeTickets, long preparingTickets, long readyTickets, long delayedTickets) {
        this.totalToday = totalToday;
        this.activeTickets = activeTickets;
        this.preparingTickets = preparingTickets;
        this.readyTickets = readyTickets;
        this.delayedTickets = delayedTickets;
    }

    public long getTotalToday() {
        return totalToday;
    }

    public void setTotalToday(long totalToday) {
        this.totalToday = totalToday;
    }

    public long getActiveTickets() {
        return activeTickets;
    }

    public void setActiveTickets(long activeTickets) {
        this.activeTickets = activeTickets;
    }

    public long getPreparingTickets() {
        return preparingTickets;
    }

    public void setPreparingTickets(long preparingTickets) {
        this.preparingTickets = preparingTickets;
    }

    public long getReadyTickets() {
        return readyTickets;
    }

    public void setReadyTickets(long readyTickets) {
        this.readyTickets = readyTickets;
    }

    public long getDelayedTickets() {
        return delayedTickets;
    }

    public void setDelayedTickets(long delayedTickets) {
        this.delayedTickets = delayedTickets;
    }
}

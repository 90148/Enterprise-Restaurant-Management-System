package com.example.restaurant.dto.setting;

public class SettingDto {
    private String id;
    private String outletId;
    private String settingKey;
    private String settingValue;

    public SettingDto() {
    }

    public SettingDto(String id, String outletId, String settingKey, String settingValue) {
        this.id = id;
        this.outletId = outletId;
        this.settingKey = settingKey;
        this.settingValue = settingValue;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getOutletId() {
        return outletId;
    }

    public void setOutletId(String outletId) {
        this.outletId = outletId;
    }

    public String getSettingKey() {
        return settingKey;
    }

    public void setSettingKey(String settingKey) {
        this.settingKey = settingKey;
    }

    public String getSettingValue() {
        return settingValue;
    }

    public void setSettingValue(String settingValue) {
        this.settingValue = settingValue;
    }
}

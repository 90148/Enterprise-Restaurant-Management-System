package com.example.restaurant.repository;

import com.example.restaurant.entity.Setting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SettingRepository extends JpaRepository<Setting, String> {

    List<Setting> findByOutletId(String outletId);

    Optional<Setting> findByOutletIdAndSettingKey(String outletId, String settingKey);

    void deleteByOutletIdAndSettingKey(String outletId, String settingKey);
}

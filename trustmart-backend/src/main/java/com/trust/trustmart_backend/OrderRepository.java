
package com.trust.trustmart_backend;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByBuyerEmailOrderByOrderDateDesc(String buyerEmail);

    List<Order> findByProduct_SellerNameOrderByOrderDateDesc(String sellerName);
}

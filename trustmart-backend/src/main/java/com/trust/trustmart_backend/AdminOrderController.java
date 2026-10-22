
package com.trust.trustmart_backend;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/orders")
public class AdminOrderController {

    private final OrderRepository orderRepository;

    public AdminOrderController(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @GetMapping
    public List<Order> getAllOrders(Authentication authentication) {
        return orderRepository.findAll()
                .stream()
                .sorted((a, b) -> b.getOrderDate().compareTo(a.getOrderDate()))
                .toList();
    }
}

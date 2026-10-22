
package com.trust.trustmart_backend;

import com.trust.trustmart_backend.product.Product;
import com.trust.trustmart_backend.product.ProductRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public OrderController(
            OrderRepository orderRepository,
            ProductRepository productRepository,
            UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    private User getLoggedInUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED, "Please log in");
        }

        return userRepository.findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "User account not found"));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Order placeOrder(
            @Valid @RequestBody PlaceOrderRequest request,
            Authentication authentication) {

        User buyer = getLoggedInUser(authentication);

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Product not found"));

        if (request.getPhone().trim().isEmpty()
                || request.getDeliveryAddress().trim().isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Phone and delivery address are required");
        }

        if (product.getSellerName().equalsIgnoreCase(buyer.getName())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "You cannot order your own product");
        }

        Order order = new Order();
        order.setBuyerEmail(buyer.getEmail());
        order.setProduct(product);
        order.setTotalPrice(product.getPrice());
        order.setPhone(request.getPhone().trim());
        order.setDeliveryAddress(request.getDeliveryAddress().trim());

        return orderRepository.save(order);
    }

    @GetMapping("/my")
    public List<Order> getMyOrders(Authentication authentication) {
        User buyer = getLoggedInUser(authentication);

        return orderRepository.findByBuyerEmailOrderByOrderDateDesc(
                buyer.getEmail());
    }

    @GetMapping("/seller")
    public List<Order> getSellerOrders(Authentication authentication) {
        User seller = getLoggedInUser(authentication);

        return orderRepository.findByProduct_SellerNameOrderByOrderDateDesc(
                seller.getName());
    }

    @PatchMapping("/{id}/status")
    public Order updateOrderStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request,
            Authentication authentication) {

        User seller = getLoggedInUser(authentication);

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Order not found"));

        if (!order.getProduct().getSellerName()
                .equalsIgnoreCase(seller.getName())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You cannot manage this order");
        }

        String status = request.get("status");

        if (status == null || !List.of(
                "CONFIRMED",
                "SHIPPED",
                "DELIVERED",
                "CANCELLED"
        ).contains(status.toUpperCase())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Invalid order status");
        }

        order.setStatus(status.toUpperCase());
        return orderRepository.save(order);
    }
}
    